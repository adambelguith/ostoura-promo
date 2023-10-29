import axios from 'axios';
import { useRouter } from 'next/router';
import { useContext} from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import { XCircleIcon } from '@heroicons/react/outline';
import ProductItem from '../components/ProductItem';
import PromotionProduct from '../components/PromotionItem';
import {Product,Category,Subcategory} from '../models/Product';
import db from '../utils/db';

const PAGE_SIZE = 20;

const prices = [
  {
    name: 'TND 1 to 50',
    value: '1-50',
  },
  {
    name: 'TND 51 to 200',
    value: '51-200',
  },
  {
    name: 'TND 201 to 1000',
    value: '201-1000',
  },
];



export default function Search(props) {
  const router = useRouter();

  const {
    query = 'all',
    category = 'all',
    subcategory='all',
    brand = 'all',
    price = 'all',
    page = 1,
  } = router.query;
  const { products, categories,subcategories, pages} = props;

  const filterSearch = ({
    page,
    category,
    subcategory,
    brand,
    sort,
    min,
    max,
    searchQuery,
    price,
    rating,
  }) => {
    const { query } = router;
    if (page) query.page = page;
    if (searchQuery) query.searchQuery = searchQuery;
    if (sort) query.sort = sort;
    if ( category){query.category = category;}
    if (category && !subcategory) delete query.subcategory
    if (subcategory) query.subcategory = subcategory;
    if (brand) query.brand = brand;
    if (price) query.price = price;
    if (rating) query.rating = rating;
    if (min) query.min ? query.min : query.min === 0 ? 0 : min;
    if (max) query.max ? query.max : query.max === 0 ? 0 : max;
    
    router.push({
      pathname: router.pathname,
      query: query,
    });
  };
  const categoryHandler = (e) => {
    filterSearch({ category: e.target.value });
  };
  const subcategoryHandler = (e) => {

    filterSearch({ subcategory: e.target.value });
  };
  const pageHandler = (page) => {
    filterSearch({ page });
  };
  const brandHandler = (e) => {
    filterSearch({ brand: e.target.value });
  };
  const priceHandler = (e) => {
    filterSearch({ price: e.target.value });
  };
   
const filterProducts = (product, query) => {
  const { category, subcategory } = query;
  const categoryMatches = !category  || product.category=== category || category == "all";
  const subcategoryMatches = !subcategory || product.subcategory === subcategory || subcategory == "all";
  // const brandMatches = !brand || product.brand === brand || brand =="all";
  return categoryMatches && subcategoryMatches;
};
const filteredProducts = products.filter((product) => filterProducts(product, router.query));
const brandSet = new Set();
filteredProducts.forEach((product) => {
  brandSet.add(product.brand);
});
const brandList = [...brandSet];

const { state, dispatch } = useContext(Store);
const addToCartHandler = async (product) => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      toast.error('Sorry. Product is out of stock');
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
  };

  // const [showsub , setShowSub] =useState(false)
  // useEffect(()=>{
 
  //   if(category != "all" && category){
  //     setShowSub(true)
  //   } else(setShowSub(false))   
  // },[category])
  return (
    <Layout title="search">
      <div className="grid grid-cols-1 md:grid-cols-4 md:gap-6">
        <div className='mr-5 ml-6 sm:ml-0'>
          <div className="my-3">
            <h2>Categories</h2>
            <select
              className="w-5/6"
              value={category}
              onChange={categoryHandler}
            >
              <option key={1} value="all">All</option>
              { categories.map((category, index) => (
                  <option key={index} value={category.name}>
                    {category.name}
                  </option>
                  
                ))}
            </select>
          </div>
          {category != "all"  && (
             <div className="my-3">
             <h2>Subcategories</h2>
             <select
               className="w-5/6"
               value={subcategory}
               onChange={subcategoryHandler}
             >
               <option key={1} value="all">All</option>
               {subcategories
                 .filter((sub) => sub.category === category)
                 .map((subcategory, index) => (
                   <option key={index} value={subcategory.name}>
                     {subcategory.name}
                   </option>
                 ))}
             </select>
           </div>
          )}
          <div className="mb-3">
            <h2>Brands</h2>
            <select className="w-5/6" value={brand} onChange={brandHandler}>
              <option key={1} value="all">All</option>
              { brandList.map((brand, index) => (
                  <option key={index} value={brand}>
                    {brand}
                  </option>
                ))}
            </select>
          </div>
          <div className="mb-3">
            <h2>Prices</h2>
            <select className="w-5/6" value={price} onChange={priceHandler}>
              <option key={1} value="all">All</option>
              {prices.map((price) => (
                  <option key={price.value} value={price.value}>
                    {price.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="mb-2 flex items-center justify-between border-b-2 pb-2">
            <div className="flex items-center">
              {filteredProducts.length === 0 ? 'No' : filteredProducts.length} Results
              {query !== 'all' && query !== '' && ' : ' + query}
              {category !== 'all' && ' : ' + category}
              {subcategory !== 'all' && ' : ' + subcategory}
              {brand !== 'all' && ' : ' + brand}
              {price !== 'all' && ' : Price ' + price}
 
              &nbsp;
              {(query !== 'all' && query !== '') ||
              category !== 'all' ||
              subcategory !== 'all' ||
              brand !== 'all' ||
              price !== 'all' ? (
                <button onClick={() => router.push('/search')}>
                  <XCircleIcon className="h-5 w-5" />
                </button>
              ) : null}
            </div>    
          </div>
          <div className='mt-6'>
            <div className="ml-16 sm:ml-0 grid grid-cols-1 sm:grid-cols-2 gap-6 xlg:grid-cols-3 2xl:grid-cols-4  ">
              {
              filteredProducts.map((product, index) => (
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
            <ul className="flex mt-4">
              {(filteredProducts.length >= 20 || page >1) &&(
                [...Array(pages).keys()].map((pageNumber) => (
                  <li key={pageNumber}>
                    <button
                      className={`default-button m-2 ${
                        page == pageNumber + 1 ? 'font-bold' : ''
                      } `}
                      onClick={() => pageHandler(pageNumber + 1)}
                    >
                      {pageNumber + 1}
                    </button>
                  </li>
                )))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ query }) {
  const pageSize = query.pageSize || PAGE_SIZE;
  const page = query.page || 1;
  const  category = query.category || '' ;
  const subcategory = query.subcategory || '';
  const brand = query.brand || '';
  const price = query.price || '';
  const rating = query.rating || '';
  const sort = query.sort || '';
  const searchQuery = query.query || '';
  
  const queryFilter =
    searchQuery && searchQuery !== 'all'
      ? {
          name: {
            $regex: searchQuery,
            $options: 'i',
          },
        }
      : {};
 
  const categoryFilter = category && category !== 'all' ? { name :category } : {};
  // const subcategoryFilter = subcategory && subcategory !== 'all' ? { subcategory } : {};
  const brandFilter = brand && brand !== 'all' ? { brand } : {};
  const ratingFilter =
    rating && rating !== 'all'
      ? {
          rating: {
            $gte: Number(rating),
          },
        }
      : {};


  const priceFilter =
    price && price !== 'all'
      ? {
          price: {
            $gte: Number(price.split('-')[0]),
            $lte: Number(price.split('-')[1]),
          },
        }
      : {};
  const order =
    sort === 'featured'
      ? { isFeatured: -1 }
      : sort === 'lowest'
      ? { price: 1 }
      : sort === 'highest'
      ? { price: -1 }
      : sort === 'toprated'
      ? { rating: -1 }
      : sort === 'newest'
      ? { createdAt: -1 }
      : { _id: -1 };

  await db.connect();
  
  const categoryi = await Category.find(categoryFilter);
  const subcategoryi = await Category.find({name: subcategory});
  const categories = await Category.find({});
  const subcategories = await Subcategory.find({}).lean();
  // const brands = await Product.find({}).distinct('brand');
  let productDocs;
  if(category || ''){
     productDocs = await Product.find(
      {
        ...categoryi,
        ...subcategoryi,
        ...queryFilter,
        ...priceFilter,
        ...brandFilter,
        ...ratingFilter,
      },
      '-reviews'
    ).populate('category').populate('subcategory')
      .sort(order)
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .lean();
  } else {
    productDocs = await Product.find(
      {
        ...queryFilter,
        ...priceFilter,
        ...brandFilter,
        ...ratingFilter,
      },
      '-reviews'
    ).populate('category').populate('subcategory')
      .sort(order)
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .lean();
  }

  const countProducts = await Product.countDocuments({

    ...categoryi,
    ...subcategoryi,
    ...queryFilter,
    ...priceFilter,
    ...brandFilter,
    ...ratingFilter,
  });
  await db.disconnect();
  const products = productDocs.map(db.convertDocToObj);
  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
      pages: Math.ceil(countProducts / pageSize),
      categories: JSON.parse(JSON.stringify(categories)),
      subcategories: JSON.parse(JSON.stringify(subcategories)),
    },
  };
}
