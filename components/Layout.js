/* eslint-disable @next/next/link-passhref */
/* eslint-disable @next/next/no-img-element */
import { signOut, useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import Cookies from 'js-cookie';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { ToastContainer } from 'react-toastify';
import { Menu } from '@headlessui/react';
import 'react-toastify/dist/ReactToastify.css';
import { Store } from '../utils/Store';
import DropdownLink from './DropdownLink';
import { useRouter } from 'next/router';
import { SearchIcon } from '@heroicons/react/outline';
import { Icon } from '@iconify/react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import axios from 'axios';
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import NextNProgress from 'nextjs-progressbar';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import Image from 'next/image';


export default function Layout({ title, children }) {
  const { status, data: session } = useSession();

  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryresp, setSelectedCategoryresp] = useState(null);
  const [subcategoryData, setSubcategoryData] = useState(null);
  const [products , setProducts ]= useState([])
  const bottomCategoryRef = useRef(null);
  const componentContainerRef = useRef(null);
  const [categoryPositions, setCategoryPositions] = useState({}); 
  const [isCategorySvg, setIsCategorySvg] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHoveredearch, setIsHoveredSearch] = useState(false);
  const [showbutton, setShowButton] = useState(false);
  useEffect(() => {
    setCartItemsCount(cart.cartItems.length);
  }, [cart.cartItems]);

  const logoutClickHandler = () => {
    Cookies.remove('cart');
    dispatch({ type: 'CART_RESET' });
    signOut({ callbackUrl: '/login' });
  };

  const [query, setQuery] = useState('');

  const router = useRouter();
  const submitHandler = (e) => {
    e.preventDefault();
    router.push(`/search?query=${query}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/categories/listcat`);
        setCategories(data)
      } catch (err) {
        console.log(err)
      }
    };
    fetchData()
  }, []);
  useEffect(() => {
    if (selectedCategory) {
      const fetchData = async () => {
        try {
          const { data } = await axios.get(`/api/categories/listsub/${selectedCategory}`);
          setSubcategoryData(data)
        } catch (err) {
          console.error(err)
        }
      };
      fetchData()
    }
    if (selectedCategoryresp) {
      const fetchData = async () => {
        try {
          const { data } = await axios.get(`/api/categories/listsub/${selectedCategoryresp}`);
          setSubcategoryData(data)
        } catch (err) {
          console.log(err)
        }
      };
      fetchData()
    }
  }, [selectedCategory, selectedCategoryresp]);

  useEffect(() => {
    const handleClick = (event) => {
      if ((componentContainerRef.current && !componentContainerRef.current?.contains(event.target) && !bottomCategoryRef.current?.contains(event.target))) {
        setSelectedCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  const [previewname, setPreviwname] = useState(false)
  useEffect(() => {
    function updateSlidesPerView() {
      if (window.innerWidth <= 1024) {
        setShowButton(true);
      }else {
        setShowButton(false);
      }
    }
 function updateNames(){
  if (window.innerWidth <= 850){
    setPreviwname(true)
  } else{
    setPreviwname(false)
  }
 }
    window.addEventListener('resize', updateSlidesPerView, updateNames);
    updateSlidesPerView();
    updateNames();
    return () => {
      window.removeEventListener('resize', updateSlidesPerView, updateNames);
    };
  }, [status, previewname]);

  const toggleCategory = (categoryName, event) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null); 
    } else {
      setSelectedCategory(categoryName);
      const categoryRect = event.currentTarget.getBoundingClientRect();
      setCategoryPositions({
        ...categoryPositions,
        [categoryName]: { top: categoryRect.top + 29, left: categoryRect.left -10 },
      });
    }
  };
  
  const toggleCategoryresp = (categoryName) => {
    if (selectedCategory === categoryName) {
      setSelectedCategoryresp(null); 
    } else {
      setSelectedCategoryresp(categoryName);
    }
  };

  const calculateMenuPosition = () => {
    if (selectedCategory && categoryPositions[selectedCategory]) {
      return categoryPositions[selectedCategory];
    }
    return { top: 0, left: 0 };
  };


  useEffect(() => {
    if(title =="Home Page"){
    const fetchProduct= async () => {
      try {
        const { data } = await axios.get(`/api/products/feature`);
        setProducts(data)
      } catch (err) {
        console.log("cannot get feature")
      }
    };
    fetchProduct()
  }
  }, [title]);
const changeNav =() =>{
  setIsCategorySvg(!isCategorySvg)
}


  return (
    <>
     <NextNProgress options={{ showSpinner: false }} />
      <Head>
        <title>{title ? title =="Home Page" ? 'ostoura promo ': title + ' - ostoura' : 'ostoura'}</title>
        <meta property="og:title" content="The Rock" />
        <meta property="og:type" content="video.movie" />
        <meta property="og:url" content="https://www.imdb.com/title/tt0117500/" />
        <meta property="og:image" content="https://ia.media-imdb.com/images/rock.jpg" />
        <meta name="Ostoura" content="promo product" />
        <meta name={title} content="ostoura promo " />
        <meta name="author" content="Adam bel" />
        <link rel="icon" href="/logov3.ico" />
      </Head>

      <ToastContainer position="bottom-center" limit={1} />
     
      <div className="flex min-h-screen flex-col justify-between ">
        <header className='bg-white'>
          <nav className="flex h-24 items-center mx-2 justify-between mb-8 md:mb-4 mt-3 ">
          <div className={'flex flex-row' } >
          {showbutton && title !="search" && (<button className='' onClick={changeNav} > {isCategorySvg ? (<div className='closeCtegories' onClick={() => setSelectedCategoryresp(null)}></div>):(<div className='openCategories w-10 '></div>) } </button>)} 
              {isCategorySvg && (
              <div className='containerCategories h-screen w-screen'>
              <div className='relative inset-x-0 top-28'>
              {selectedCategoryresp ? (
                 <div className='relative left-12 w-10/12'>
                  <div className='flex '>
                   <div className='back-arrow h-12 top-4 cursor-pointer' onClick={() => setSelectedCategoryresp(null)}></div>
                   <div className='flex w-full justify-center items-center'>
                   <h2 className='text-slate-50 font-semibold mt-4 text-xl'>{selectedCategoryresp}</h2>
                   </div>
                   </div>
                 <ul className='mt-6 w-72'>
                     {subcategoryData?.map((subcategory, index) => (
                      <div className='flex w-full justify-center items-center ' key={index}>
                       <li key={index} className='text-slate-50 text-xl hover:font-semibold hover:text-[#d64545e0] mt-4'> + <Link href={`/search?category=${selectedCategoryresp}&subcategory=${subcategory.name}`} className="sub-menu-link">
                       {subcategory.name}
                     </Link></li>
                     </div>
                     ))}
                   </ul>
                 </div>
              ): (
                <ul className='flex flex-col '>
               {categories.map((category, index) =>(
            <li key={index} className="w-5/6 relative left-12">
              <button className='items link flex flex-row  justify-between' key={category.name}
               onClick={(e) => toggleCategoryresp(category.name, e)}
              >
                <p className='text-slate-50  mt-2'>{category.name}</p>
                <div className='arrow-catres h-4 w-4'></div>   
              </button>             
            </li> 
          ))}
          </ul>
              )}
          </div>
              </div>
       )}
              <div className='cursor-pointer'>
            <Link href="/" className="relative cursor-pointer ">
                <Image
                className='w-48 h-32 '
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/v1698403308/logo/infinitry_sivkfv.png`}
                alt="logo"
                width={100}
                height={50}
                />
            </Link>
            </div>
          </div>
            
            <form
              onSubmit={submitHandler}
              className="relative h-10 md:w-80 w-32 top-14 sm:top-0 justify-center flex "
            >
              <input
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                className=" w-64  rounded-lg drop-shadow-xl"
                placeholder="Search products"
              />
              <button
                className="relative rounded-r-lg text-sm right-6 "
                type="submit"
                id="button-addon2"
                onMouseEnter={() => setIsHoveredSearch(true)}
                onMouseLeave={() => setIsHoveredSearch(false)}
              >
                <SearchIcon className="h-5 w-5" color={isHoveredearch ? '#fa5858' : "#597787"}></SearchIcon>
                
              </button>
            </form>

            <div className='flex flex-row'>
              <Link href="/cart" passHref>
                <button className="mr-2 flex space-x-0"  
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                > 
                <Icon icon="heroicons-outline:shopping-cart" color={isHovered ? '#fa5858' : "#597787"} width="30" height="30" className="mt-2 pt-25" />
                  {cartItemsCount > 0 && (
                    <span className=" mb-5 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              </Link>
              {status === 'loading' ? (
                <Menu as="div" className="absolute z-40 inline-block">
                <Menu.Button className="text-blue-600 font-bold">
                  <Icon icon="mdi:user-circle" color="#597787" width="35" height="35" />
                </Menu.Button>
                  <Menu.Items className="absolute right-0 w-56 origin-top-right bg-white  shadow-lg ">
                  <Menu.Item>
                    <DropdownLink className="dropdown-link" href="/login">
                      Login
                    </DropdownLink>
                  </Menu.Item>
                  </Menu.Items>
                  </Menu>
              ) : session?.user ? (
                <Menu as="div" className="relative z-40 inline-block mt-1">
                  <Menu.Button className="text-blue-600 font-bold">
                    <Icon icon="mdi:user-circle" color="#597787" width="35" height="35" />
                  </Menu.Button>
                  <Menu.Items className="absolute right-0 w-56 origin-top-right bg-white  shadow-lg rounded-b-lg rounded-tl-lg border-indigo-500/75 ">
                    <Menu.Item>
                      <DropdownLink className="dropdown-link" href="/profile">
                        Profile
                      </DropdownLink>
                    </Menu.Item>
                    <Menu.Item>
                      <DropdownLink
                        className="dropdown-link"
                        href="/order-history"
                      >
                        Order History
                      </DropdownLink>
                    </Menu.Item>
                    {session.user.isAdmin && (
                      <Menu.Item>
                        <DropdownLink
                          className ="dropdown-link"
                          href="/admin/dashboard"
                        >
                          Admin Dashboard
                        </DropdownLink>
                      </Menu.Item>
                    )}
                    <Menu.Item>
                      <a
                        className="dropdown-link"
                        href="#"
                        onClick={logoutClickHandler}
                      >
                        Logout
                      </a>
                    </Menu.Item>
                  </Menu.Items>               
                </Menu>
                
              ) : (
                <Link href="/login" passHref>
                  <h1 className="text-blue-600 text-xl p-2 cursor-pointer">Login</h1>
                </Link>
              )}
            </div>
           
          </nav>
         
        </header>
         
          <div className='block-category h-10  content-center'>
          <ul className='list-category ' ref={componentContainerRef}>
            {categories.slice(0, 8).map((category, index) =>(
              <div key={index}>
            <li className={`item  `}>
              <button className='link flex flex-row' key={category.name}
               ref={index === categories.length - 1 ? bottomCategoryRef : null}
               onClick={(e) => toggleCategory(category.name, e)}
            >
                <p className='text-slate-50  mt-2'>{category.name}</p>
                <div className='arrow-cat h-4 w-4'></div>
              </button>             
            </li>               
            </div>
          ))}
          {categories.length > 8 && (
          <li className='cursor-pointer hover:scale-110'>
            <Link href='/search' passHref>
              <div className='flex flex-row'>
              <p className='text-slate-50  mt-2 font-medium'>All Categories</p>
              <div className='next-cat h-4 w-4 mt-2'></div>
              </div>
            </Link>
          </li>
        )}
          </ul>
          </div>
          {selectedCategory && !isCategorySvg && (
              <div className='submenu absolute bg-white p-4 shadow-md top-full left-0 mt-2 transition-all duration-300 opacity-100 scale-y-100 transform origin-top rounded-b-lg'
               style={calculateMenuPosition()}
               ref={bottomCategoryRef}
               >
                <ul>
                  {subcategoryData?.map((subcategory, index) => (
                    <li key={index} className='text-slate-50 hover:font-semibold'><Link href={`/search?category=${selectedCategory}&subcategory=${subcategory.name}`} className="sub-menu-link">
                    {subcategory.name}
                  </Link></li>
                  ))}
                </ul>
              </div>
            )}
            {title =="Home Page" && (
          <>
          <div className='main-slider ' >
             <Swiper
              modules={[Navigation, Pagination, Scrollbar, A11y,Autoplay]}
              navigation={true}
              spaceBetween={30}
              centeredSlides={true}
              autoplay={{
                delay: 8000,
              }}
              // pagination={{ clickable: true }}
              scrollbar={{ draggable: true }}
            >
              {products.map((product, index) => (         
              <SwiperSlide key={index}>
              <div className='image-layer w-full h-full bg-no-repeat bg-cover bg-center'  style={{ backgroundImage: `url(${product.image[0]})` }}>
                <div className='slide'>
                  <div className='swipe-animated'>
                    <div className='swipe-container'>
                      <div className='swipe-item'>
                        <span></span>
                      </div>
                      <div className='swipe-item'>
                        <span></span>
                      </div>
                      <div className='swipe-item'>
                        <span></span>
                      </div>
                    </div>
                  </div>
                  <div className='slide-center-container'>
                    <div className='flex content-box'>
                      <div className='box-inner'>
                        <div className='title'>
                          {product.brand}
                        </div>
                        <h1>{product.name.length > 40 ?(product.name.slice(0,previewname ? (15):(40)).split(' ').slice(0,-1).join(' ')):(product.name) }</h1>
                        <div className='sContent'>{product.description.length > 100 ?(product.description.slice(0,previewname ? (40):(100)).split(' ').slice(0,-1).join(' ').concat(" ...")):(product.description) }</div>
                        <div className='shop-now'> <Link href={`/product/${product.slug}`} className="shop-now"> Detail </Link></div>
                       
                      </div>
                      <Link href={`/product/${product.slug}`} passHref >
                      <div className='card-product-image '>
                        <img src={product.image[0]} alt={product.name} className='swiper-image-card rounded-3xl' />                      
                      </div>
                      </Link>
                    </div>
                  </div>
                </div>
                </div>
              </SwiperSlide>
              )
        )}
            </Swiper>
         </div>
         </>
         )}
         
        

        <main className="mx-4 sm:mx-12 mt-4 mb-4 pb-10">{children}</main>
        
        <footer className="relative mt-auto flex flex-row h-28 pt-10 mt-4 md:justify-between items-center shadow-inner ">
          <div className="flex flex-row space-x-4 justify-center lg:p-16 p-8 ">
            <a href="#" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-800 transition duration-300 ease-in-out facebook"><Icon icon="tabler:brand-facebook" color="mintcream" className="icons fab fa-facebook-f text-white text-2xl" /></a> 
            <a href="#" className="instgram w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-800 transition duration-300 ease-in-out"><Icon icon="bi:instagram" color="mintcream" className="icons fab fa-instagram text-white text-2xl" /></a>
          </div> 
        <Link href="/" passHref>
            <div className='pb-6'>
            <img
            src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/v1698403308/logo/logov3_xmybvp.png`}
            alt="logo"
            className="cursor-pointer"
            width={90}
            height={64}
          />
          </div>
            </Link>
            <div></div>
       {/* </div> */}
        </footer>
        <div className='fixed bottom-4 right-6 cursor-pointer hover:scale-125 z-50' >
        <a href="https://wa.me/92432442" target="_blank" rel="noopener noreferrer">
          <Image src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/v1698489964/logo/whatsapp_cztiv1_hfc2hp.png`} height={64} width={68} alt='whatsapp-logo' />
        </a>
        </div>
       
      </div>
    </>
  );
}
