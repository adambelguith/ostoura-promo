import axios from 'axios';
import { useContext,useState, useEffect  } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import ProductItem from '../components/ProductItem';
import PromotionProduct from '../components/PromotionItem';
import {Product} from '../models/Product';
import db from '../utils/db';
import { Store } from '../utils/Store';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

export default function Home({ products, mostSell, newest, promotion }) {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const [modalDefaultOpen, setModalDefaultOpen] = useState(false);
  const [productPerView, setProductPerView] = useState(12);
  const [sliderPreview , setSlidePreview] = useState(1)
  const [center , setCenter] = useState(false)
  useEffect(() => {

    function updateProductPerView() {
      if (window.innerWidth >= 1240) {
        setSlidePreview(5)
      } else if (window.innerWidth >= 1024) {
        setProductPerView(12);
        setSlidePreview(4)
      } else if (window.innerWidth >= 768) {
        setProductPerView(10);
        setSlidePreview(3)
      } else if (window.innerWidth >= 640) {
        setProductPerView(8);
        setSlidePreview(2)
      } else {
        setProductPerView(6);
        setSlidePreview(1)
        setCenter(true)
      }
    }
    window.addEventListener('resize', updateProductPerView);
    updateProductPerView();
    return () => {
      window.removeEventListener('resize', updateProductPerView);
    };
  }, []);

  const addToCartHandler = async (product, quantityitem) => {
    const existItem = cart.cartItems.find((x) => x.slug === product.slug);
    const quantity = existItem ? existItem.quantity + quantityitem : quantityitem ? quantityitem : 1 ;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      return toast.error('Sorry. Product is out of stock');
    }
    setModalDefaultOpen(true)
   
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });

    toast.success('Product added to the cart');
  };
  const addToCartHandlerslide = async (product, quantityitem) => {
    const existItem = state.cart.cartItems.find((x) => x.slug === product.slug);
    const quantity = existItem ? existItem.quantity + quantityitem : quantityitem ? quantityitem : 1 ;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      return toast.error('Sorry. Product is out of stock');
    }
    setModalDefaultOpen(true)
   
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });

    toast.success('Product added to the cart');
  };



  return (
    <Layout title="Home Page">
      <div className="products-heading">
      <h2>Most Selling Products</h2>
    </div>
<div className='bg-white rounded-lg'>
    <Swiper
              modules={[Navigation, Pagination, Scrollbar, A11y,Autoplay]}
              navigation={true}
              spaceBetween={20}
              slidesPerView={sliderPreview}
              centeredSlides={center}
              autoplay={{
                delay: 1000,
              }}
              // pagination={{ clickable: true }}
              scrollbar={{ draggable: true }}
              className='rec-swiper'
            >
              {mostSell.map((product, index) => (         
              <SwiperSlide key={index}>
                <div className='ml-20 sm:ml-0'>
                {product.promotion ? (
                    <PromotionProduct
                      key={product._id}
                      product={product}
                      addToCartHandler={addToCartHandler}
                    />
                  ):(
                    <ProductItem
                      key={product._id}
                      product={product}
                      addToCartHandler={addToCartHandler}
                    />
                  )}     
                </div>
              </SwiperSlide>
              )
        )}
            </Swiper>
            </div>

    {promotion?.length  &&(
      <div className='' >
      <div className="products-heading">
      <h2 className='text-red-600'> Promotion product </h2>
    </div>
    <div className='flex w-full justify-center items-center bg-white rounded-lg'>
      <div className="ml-20 sm:ml-0 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xlg:grid-cols-4 products-container mb-12 ml-6 sm:ml-0 ">
        {promotion.slice(0,productPerView).map((product) => (
          <PromotionProduct
            product={product}
            key={product.slug}
            addToCartHandler={addToCartHandler}
          ></PromotionProduct>
        ))}
      </div>
      </div>
     
      <div className='flex w-full justify-center items-center mt-4'>
      <Link href={"/promotion"} passHref>
      <div className='py-4 px-8 left-1/2 border-4 border-red-700 rounded-lg hover:border-[#d64545e0] hover:scale-105 hover:cursor-pointer group '>
        <button className=''>
          <p className='text-red-700 group-hover:text-[#ee922ae0] '>All promotion </p>
        </button>
      </div>
      </Link>
      </div>
      </div>
    )}

    <div className="products-heading">
      <h2> Recent Products </h2>
    </div>
    <div className='flex w-full justify-center items-center bg-white rounded-lg'>
      <div className="ml-20 sm:ml-0 grid grid-flow-row-dense grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xlg:grid-cols-4 products-container mb-12 ml-6 sm:ml-0 ">
        {newest.slice(0,productPerView).map((product, index) => (
          <div key={index}>
         {product.promotion ? (
                    <PromotionProduct
                      key={product._id}
                      product={product}
                      addToCartHandler={addToCartHandler}
                    />
                  ):(
                    <ProductItem
                      key={product._id}
                      product={product}
                      addToCartHandler={addToCartHandler}
                    />
                  )}     
          </div>
        ))}
      </div>
      </div>
     
      <div className='flex w-full justify-center items-center '>
      <Link href={"/search"} passHref>
      <div className=' mt-4 py-4 px-8 left-1/2 border-4 border-blue-700 rounded-lg hover:border-[#d64545e0] hover:scale-105 hover:cursor-pointer group '>
        <button className=' '>
          <p className='text-blue-700 group-hover:text-[#ee922ae0] '>all Recent products </p>
        </button>
      </div>
      </Link>
          </div>
          

      <div className="products-heading">
      <h2> All Products </h2>
    </div>
      <div className=" grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 products-container mb-12 bg-white rounded-lg p-4 ">
        {products.slice(0,productPerView).map((product, index) => (
         <div key={index} className='ml-20 sm:ml-0'>
         {product.promotion ? (
                    <PromotionProduct
                      key={product._id}
                      product={product}
                      addToCartHandler={addToCartHandler}
                    />
                  ):(
                    <ProductItem
                      key={product._id}
                      product={product}
                      addToCartHandler={addToCartHandler}
                    />
                  )}     
          </div>
        ))}
      </div>
      <div className='flex w-full justify-center items-center '>
      <Link href={"/search"} passHref>
      <div className='py-4 px-8 left-1/2 border-4 border-blue-700 rounded-lg hover:border-[#d64545e0] hover:scale-105 hover:cursor-pointer group'>
        <button className=' '>
          <p className='text-blue-700 group-hover:text-[#ee922ae0]'>Voir plus Recent products </p>
        </button>
      </div>
      </Link>
          </div>


          {modalDefaultOpen && (
            <div
            className="fixed inset-0 flex items-center justify-center z-10 "
          >
             <div className="absolute inset-0 bg-black opacity-40 flex h-screen items-center justify-center"></div>
             <div className=' bg-white z-10 w-9/12 border-sky-200 border-2 rounded-xl '>
            <div className="flex justify-between  p-4 rounded-lg z-10">
              <h1 className="text-xl">
                Add to cart
              </h1>
              <button
                  aria-label="Close"
                  className=""
                  onClick={() => setModalDefaultOpen(false)}
                  type="button"
                >
              <div className='closeModal'>
              </div>
              </button>
            </div>
            <div className=" modal-body">
            <div className="product-list-container pb-12">
                <div className="product-list index-cart relative top-6 ">
                {newest.map((product) => (
                    <div className='product-item mx-8 lg:mx-2' key={product.slug}>
                    {product.promotion ? (
                    <PromotionProduct
                      key={product._id}
                      product={product}
                      addToCartHandler={addToCartHandlerslide}
                    />
                  ):(
                    <ProductItem
                      key={product._id}
                      product={product}
                      addToCartHandler={addToCartHandlerslide}
                    />
                  )}  
                  </div>
                  ))}
                </div>
              </div>
            </div>
            <div className=" flex justify-between mx-2 p-6">
              <div className='hover:scale-x-110'>
            <Link href={"/cart"} passHref>
              <div className='flex border-2 border-stone-300 cursor-pointer rounded-xl h-12 w-28 gap-x-0.5 bg-[#079afc]'>
                <h1 className='mt-2 ml-2 text-[#eee]'> go to cart</h1> <Icon icon="heroicons-outline:shopping-cart" color="#eee" width="25" height="20" className="mt-2 pt-25" />
                
              </div>
              </Link>
              </div>
              <button
                className="bg-[#079afc] rounded-xl h-12 w-24 hover:scale-x-110"
                color="link"
                onClick={() => setModalDefaultOpen(false)}
                type="button"
              >
                <h1 className='text-white'>Continue</h1>
              </button>
            </div>
            </div>
          </div>
 

          )}
          

    <div className="products-heading">
      <h2>About Ostoura Promo</h2>
      <p>We bring the cheapest products and always have discounts on all products. We want to enable purchasing for the client.</p>
    </div>

    {/* <div className="products-heading">
      <h2> </h2>
      <MapsLocation />
    </div> */}

    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  const products = await Product.find({}).populate("category", "name")
  .populate("subcategory", "name")
  .lean()
  .exec();
  const mostsell = await Product.find({}).sort({ sell: -1 }).limit(20);
  const newest = await Product.find({}).sort({ createdAt: -1}).limit(20).lean();
  const promotion = await Product.find({ promotion: { $gte: 1 } }).sort({promotion:-1}).limit(20).lean();
  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
      mostSell : JSON.parse(JSON.stringify(mostsell)),
      newest : JSON.parse(JSON.stringify(newest)),
      promotion : JSON.parse(JSON.stringify(promotion)),
    },
  };
}
