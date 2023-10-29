import axios from 'axios';
import Link from 'next/link';

import { useContext, useState,useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import {Product} from '../../models/Product';
import db from '../../utils/db';
import { Store } from '../../utils/Store';
import ReactImageMagnify from 'react-image-magnify';
import ProductList from '../../components/ProductList';
import PromotionProduct from '../../components/PromotionItem';

import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import { Icon } from '@iconify/react';



export default function ProductScreen(props) {
  const { product,products } = props;
  const { state, dispatch } = useContext(Store)
  const [modalDefaultOpen, setModalDefaultOpen] = useState(false);
  const existItem = state.cart.cartItems.find((x) => x.slug === product.slug);
  const existcart = existItem?.quantity ? existItem.quantity : 0;
  let [quantitys, setQuantityProduct] = useState(existcart);
  
 

 
 
  const [slidesPerView, setSlidesPerView] = useState(1);
  const [center , setCenter] = useState(false)
  useEffect(() => {
    function updateSlidesPerView() {
      if (window.innerWidth >= 1024) {
        setSlidesPerView(4);
      } else if (window.innerWidth >= 768) {
        setSlidesPerView(3);
      } else if (window.innerWidth >= 640) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(1);
        setCenter(true)
      }
    }

    window.addEventListener('resize', updateSlidesPerView);
    updateSlidesPerView();
    return () => {
      window.removeEventListener('resize', updateSlidesPerView);
    };
  }, []);


  const [imges, setImg] = useState(product.image[0]);
  const [indeximage, setIndexImage] = useState(0)
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [sliderPreview , setSlidePreview] = useState(1)

  useEffect(() => {
    function updateProductPerView() {
     if (window.innerWidth >= 1024) {
        setSlidePreview(2)
      } else {
        setSlidePreview(1)
      }
    }
    window.addEventListener('resize', updateProductPerView);
    updateProductPerView();
    return () => {
      window.removeEventListener('resize', updateProductPerView);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1280px)');
    const handleMediaQueryChange = () => setZoomEnabled(mediaQuery.matches);
    mediaQuery.addListener(handleMediaQueryChange);
    handleMediaQueryChange();

    return () => mediaQuery.removeListener(handleMediaQueryChange);
  }, [zoomEnabled]);



 const hoverHandler = (image, i) => {
     setImg(image);
     setIndexImage(i)
 };
 const goBack = () => {
  window.history.back(); 
};
useEffect(()=>{

},[imges, indeximage])

const addToCartHandler = async ( ) => {
  const existItem = state.cart.cartItems.find((x) => x.slug === product.slug);
  const quantity = existItem ? existItem.quantity + quantitys : quantitys ? quantitys : 1 ;
  const { data } = await axios.get(`/api/products/${product._id}`);

  if (data.countInStock < quantity) {
    return toast.error('Sorry. Product is out of stock');
  }
  setModalDefaultOpen(true)
  dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });

};

if (!product) {
  return <Layout title="Produt Not Found" ><h1 className='flex w-full justify-center items-center text-3xl'>Produt Not Found</h1></Layout>;
}
  return (
    
    <Layout title={product.name}>
      <div className="py-2 flex text-[#128EFF] cursor-pointer lg:mb-4 " onClick={goBack}>
        <div className='back-products'></div>
        back to products
      </div>
      
<div className="flex flex-col space-y-20 mb-6">    
  <div className="product-detail-container">
      <div>
      {zoomEnabled ? (
        <div className="lefts-item ">
        <div className="grid grid-cols-8 gap-2">
            {product.image.map((image, i) => (
                <div
                    className={indeximage == i ? 'img_wrap active' : 'img_wrap'}
                    key={i} 
                    onClick={() => hoverHandler(image, i)}
                >
                    <img className='image-size' src={image} alt="" height={640} width={640} />
                </div>
            ))}
            {product.video &&(
              <div className='video-play'  onClick={() => hoverHandler(product.video,  product.image.length+1)}>
              <video width='70' height='70' className={indeximage == product.image.length+1 ? 'img_wrap active' : 'img_wrap '}>
                <source src={product.video} type='video/mp4' />
              </video>
              </div>
               )}
        </div>
        <div className="left_2">
          {indeximage > product.image.length ? (
            <video width='100%' height='100%' controls>
            <source src={product.video} type='video/mp4' />
          </video>
          ):(<ReactImageMagnify
            className='custom-image-magnify '
              {...{
                  smallImage: {
                      alt: '',
                      isFluidWidth: true,
                      src: imges,
                  },
                  largeImage: {
                      src: imges,
                      width: 2000,
                      height: 2000,
                  },
                  enlargedImageContainerDimensions: {
                      width: '250%',
                      height: '210%',
                  },
              }}
          />)}
            
        </div>
    </div>
     
      ) : (
        <div className='main-slider'>
          <Swiper
              modules={[Navigation, Pagination, Scrollbar, A11y,Autoplay]}
              navigation={true}
              spaceBetween={30}
              // centeredSlides={true}
              autoplay={{
                delay: 8000,
              }}
              pagination={{ clickable: true }}
              scrollbar={{ draggable: true }}
              slidesPerView={sliderPreview}
              // className='h-3/5'
            >
              {product.image.map((image,index) => (        
              <SwiperSlide key={index}>
               <div className='h-full'>
                <img src={image} alt={product.name} className='h-full w-full '/>
              </div>
              </SwiperSlide>
              )
        )}
        {product.video && (
          <SwiperSlide >
          <div className='h-full w-full'>
          <video className='h-full w-full ' controls>
            <source src={product.video} type="video/mp4" />
          </video>
          </div>
          </SwiperSlide>
      )}
            </Swiper>
      </div>
      )}
      </div>
      
        <div className="product-detail-desc relative flex flex-col w-full justify-center items-center">
          <p className='text-xl'>{product.name}</p>
          
          <div className="price flex ">Price: {product.promotion ? (<div className='ml-2'><span>{parseFloat((product.price - ((product.price*product.promotion)/100)).toFixed(2))}</span><span className='line-through text-sm ml-2'>{product.price}</span></div>):(<span>{product.price}</span>)}  <span className=' ml-2'>TND</span></div>
          {product.promotion && (<div className='text-lg text-red-500'>Promotion {product.promotion}%</div>)}
          <div className="quantity">
            <h3 >Quantity: </h3> <h2 className='count-qty'> {product.countInStock > 0 ? product.countInStock : 'Unavailable'} </h2>
            <div className='flex ml-6 ' ><p className='font-thin text-md whitespace-nowrap'>selling product: </p> <p className='ml-2 text-lg text-green-400'>{product.sell}</p></div>
          </div>
          
          {product.countInStock >0 &&(
            <div className="h-12 mt-12 ml-0 sm:ml-8 bg-white w-32 border-[#079afc65] border-2 flex justify-center">
              <button onClick={()=>{if (quantitys >0){setQuantityProduct(quantitys-=1)}}} className='w-16'>
                <div className='moins-button cursor-pointer w-4 ml-2' ></div>
              </button>
              <input
                className="flex w-full justify-center items-center "
                value={quantitys}
                id="quantity"
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, 0);
                  value = value.slice(0, 4);
                  e.target.value = value; 
                  setQuantityProduct(parseInt(value)||0)
                }}
                />
              <button onClick={()=>{if(quantitys < product.countInStock) {setQuantityProduct(quantitys+=1)}}} className=''>
                <div className='plus-button cursor-pointer ' ></div>
              </button>
          </div>
          )}



          <div className="buttons ml-0 sm:ml-6">
            <button type="button" className="buy-now" onClick={addToCartHandler}>Add to Cart</button>
          </div>
        </div>
      </div>

          
            

  </div>
  <div className='flex w-full justify-center items-center mb-6 '>
    <h1 className='text-4xl text-[#031927]'> Description </h1>
  </div>
  <div className='flex w-full justify-center items-center '>
    <p className='text-center '>{product.description}</p>
  </div>

  <div className='flex w-full  justify-center items-center my-12'>
    <h1 className='text-4xl text-[#031927]'> Recommend products </h1>
  </div>
  <Swiper
    modules={[Navigation, Pagination, Scrollbar, A11y,Autoplay]}
    navigation={true}
    spaceBetween={20}
    slidesPerView={slidesPerView}
    centeredSlides={center}
    autoplay={{
      delay: 1000,
    }}
    scrollbar={{ draggable: true }}
    className='rec-swiper'
  >
    {products.map((product, index) => (         
    <SwiperSlide key={index}>
      <div className='ml-16 sm:ml-0'>
      {product.promotion ? (
        <PromotionProduct
          key={product._id}
          product={product}
          addToCartHandler={addToCartHandler}
        />
      ):(
        <ProductList
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
                {products.map((product) => (
                    <div className='product-item mx-8 lg:mx-2' key={product.slug}>
                   {product.promotion ? (
                    <PromotionProduct
                      key={product._id}
                      product={product}
                      addToCartHandler={addToCartHandler}
                    />
                  ):(
                    <ProductList
                      key={product._id}
                      product={product}
                      addToCartHandler={addToCartHandler}
                    />
                  )}  
                  </div>
                  ))}
                </div>
              </div>
            </div>
            <div className=" flex justify-between mx-2 p-6">
              <div className=''>
            <Link href={"/cart"} passHref>
              <div className='flex border-2 border-stone-300 cursor-pointer rounded-xl h-12 w-28 gap-x-0.5'>
                <h1 className='mt-2 ml-2 text-blue-400'> go to cart</h1> <Icon icon="heroicons-outline:shopping-cart" color="#597787" width="25" height="20" className="mt-2 pt-25" />
                
              </div>
              </Link>
              </div>
              <button
                className="bg-[#079afc] rounded-xl h-12 w-24"
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
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;

  await db.connect();
  const product = await Product.findOne({ slug }).lean();
  const products = await Product.find({category: product.category}).limit(25).lean();
  await db.disconnect();
  return {
    props: {
      product: product ? JSON.parse(JSON.stringify(product)) : null,
      products: products ? JSON.parse(JSON.stringify(products)) : null,
    },
  };
}


