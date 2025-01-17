import axios from 'axios';
import { useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import ProductItem from '../components/ProductItem';
import PromotionProduct from '../components/PromotionItem';
import db from '../utils/db';
import { Store } from '../utils/Store';
import Link from 'next/link';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

export default function Home({ products, mostSell, newest, promotion }) {
  const { state, dispatch } = useContext(Store);
  const [modalDefaultOpen, setModalDefaultOpen] = useState(false);
  const [sliderPreview, setSliderPreview] = useState(4);
  const [center, setCenter] = useState(false);
  const [productPerView, setProductPerView] = useState(8);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSliderPreview(1);
        setCenter(true);
        setProductPerView(4);
      } else {
        setSliderPreview(4);
        setCenter(false);
        setProductPerView(8);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const addToCartHandler = async (product, quantity = 1) => {
    const existItem = state.cart.cartItems.find((x) => x.slug === product.slug);
    const qty = existItem ? existItem.quantity + quantity : quantity;

    if (!product.countInStock) {
      return toast.error('Sorry. Product is out of stock');
    }
    if (product.countInStock < qty) {
      return toast.error('Sorry. Product has insufficient stock');
    }

    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity: qty } });
    setModalDefaultOpen(true);
  };

  const addToCartHandlerslide = async (product, quantity = 1) => {
    const existItem = state.cart.cartItems.find((x) => x.slug === product.slug);
    const qty = existItem ? existItem.quantity + quantity : quantity;

    if (!product.countInStock) {
      return toast.error('Sorry. Product is out of stock');
    }
    if (product.countInStock < qty) {
      return toast.error('Sorry. Product has insufficient stock');
    }

    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity: qty } });
  };

  return (
    <Layout title="Home Page">
      {/* Most Selling Products Section */}
      <div className="products-heading">
        <h2>Most Selling Products</h2>
      </div>
      <div className='bg-white rounded-lg'>
        <Swiper
          modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
          navigation={true}
          spaceBetween={20}
          slidesPerView={sliderPreview}
          centeredSlides={center}
          autoplay={{ delay: 1000 }}
          scrollbar={{ draggable: true }}
          className='rec-swiper'
        >
          {mostSell.map((product) => (
            <SwiperSlide key={product.id}>
              <div className='ml-20 sm:ml-0'>
                {product.promotion ? (
                  <PromotionProduct
                    product={product}
                    addToCartHandler={addToCartHandler}
                  />
                ) : (
                  <ProductItem
                    product={product}
                    addToCartHandler={addToCartHandler}
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Promotion Products Section */}
      {promotion?.length > 0 && (
        <div>
          <div className="products-heading">
            <h2 className='text-red-600'>Promotion Products</h2>
          </div>
          <div className='flex w-full justify-center items-center bg-white rounded-lg'>
            <div className="ml-20 sm:ml-0 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xlg:grid-cols-4 products-container mb-12">
              {promotion
                .filter(product => product.status === 'approved')
                .slice(0, productPerView)
                .map((product) => (
                  <PromotionProduct
                    key={product.id}
                    product={product}
                    addToCartHandler={addToCartHandler}
                  />
                ))}
            </div>
          </div>
          <div className='flex w-full justify-center items-center mt-4'>
            <Link href="/promotion" passHref>
              <div className='py-4 px-8 border-4 border-red-700 rounded-lg hover:border-[#d64545e0] hover:scale-105 hover:cursor-pointer group'>
                <button>
                  <p className='text-red-700 group-hover:text-[#ee922ae0]'>Promotions</p>
                </button>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Recent Products Section */}
      <div className="products-heading">
        <h2>Recent Products</h2>
      </div>
      <div className='flex w-full justify-center items-center bg-white rounded-lg'>
        <div className='ml-20 sm:ml-0 grid grid-flow-row-dense grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xlg:grid-cols-4 products-container mb-12'>
          {newest
            .filter(product => product.status === 'approved')
            .slice(0, productPerView)
            .map((product) => (
              <div key={product.id}>
                {product.promotion ? (
                  <PromotionProduct
                    product={product}
                    addToCartHandler={addToCartHandler}
                  />
                ) : (
                  <ProductItem
                    product={product}
                    addToCartHandler={addToCartHandler}
                  />
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Cart Modal */}
      {modalDefaultOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-10">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className='bg-white z-10 w-9/12 border-sky-200 border-2 rounded-xl'>
            {/* Modal content */}
          </div>
        </div>
      )}
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  
  // Get only approved products
  const products = await db.mysql.product.findMany({
    where: { status: 'approved' },
    select: {
      id: true,
      name_fr: true,
      name_ar: true,
      name_url: true,
      description: true,
      images: true,
      price: true,
      quantity: true,
      status: true,
      category: {
        select: {
          id: true,
          name_fr: true,
          name_ar: true,
          name_url: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  // Most selling products
  const mostsell = await db.mysql.product.findMany({
    where: { status: 'approved' },
    select: {
      id: true,
      name_fr: true,
      name_ar: true,
      name_url: true,
      description: true,
      images: true,
      price: true,
      quantity: true,
      status: true,
      category: {
        select: {
          id: true,
          name_fr: true,
          name_ar: true,
          name_url: true
        }
      }
    },
    orderBy: { quantity: 'desc' },
    take: 20
  });

  // Newest products
  const newest = await db.mysql.product.findMany({
    where: { status: 'approved' },
    select: {
      id: true,
      name_fr: true,
      name_ar: true,
      name_url: true,
      description: true,
      images: true,
      price: true,
      quantity: true,
      status: true,
      category: {
        select: {
          id: true,
          name_fr: true,
          name_ar: true,
          name_url: true
        }
      }
    },
    orderBy: { created_at: 'desc' },
    take: 20
  });

  // Promotion products
  const promotion = await db.mysql.product.findMany({
    where: { 
      AND: [
        { status: 'approved' },
        // { price: { not: null } }
      ]
    },
    select: {
      id: true,
      name_fr: true,
      name_ar: true,
      name_url: true,
      description: true,
      images: true,
      price: true,
      quantity: true,
      status: true,
      category: {
        select: {
          id: true,
          name_fr: true,
          name_ar: true,
          name_url: true
        }
      }
    },
    orderBy: { price: 'asc' },
    take: 20
  });

  // Clean data for serialization
  const cleanData = (data) => {
    return data.map(item => ({
      ...item,
      images: item.images ? JSON.parse(JSON.stringify(item.images)) : null
    }));
  };

  return {
    props: {
      products: cleanData(products),
      mostSell: cleanData(mostsell),
      newest: cleanData(newest),
      promotion: cleanData(promotion),
    },
  };
}
