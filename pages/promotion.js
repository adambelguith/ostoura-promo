import axios from 'axios';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import PromotionProduct from '../components/PromotionItem';
import {Product} from '../models/Product';
import db from '../utils/db';

const PAGE_SIZE = 12;


export default function Search(props) {
    const router = useRouter();
  const {promotion, pages} = props;
  const {
    page = 1,
  } = router.query;

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
 
  const onPageChange = (newPage) => {
    router.push(`/promotion?page=${newPage}`);
  };
  return (
    <Layout title="QBS Promotion">
       <div className="products-heading">
      <h2 className='text-[#f84e53]'> Promotion Produit </h2>
    </div>
      <div className="grid grid-cols-1 md:grid-cols-4 md:gap-6">
        <div className="md:col-span-6">
          <div>
            <div className="ml-20 sm:ml-0 grid grid-cols-1 sm:grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4  ">
              {
              promotion.map((product, index) => (
                <div key={index}>
                <PromotionProduct
                  key={product._id}
                  product={product}
                  addToCartHandler={addToCartHandler}
                />
                </div>
              ))}

            </div>
            <div className='flex w-full justify-center items-center my-12'>
            <ul className="flex">
              {(promotion.length >= 5 || page >1) &&(
                [...Array(pages).keys()].map((pageNumber) => (
                  <li key={pageNumber}>
                    <button
                      className={`default-button m-2 ${
                        page == pageNumber + 1 ? 'font-bold' : ''
                      } `}
                      onClick={() => onPageChange(pageNumber + 1)}
                    >
                      {pageNumber + 1}
                    </button>
                  </li>
                )))}
            </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({query}) {
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    await db.connect();
    const allpromotion = await Product.find({ promotion: { $gte: 16 } }).sort({promotion:-1})
    const promotion = await Product.find({ promotion: { $gte: 16 } }).sort({promotion:-1}).skip(pageSize * (page - 1)).limit(pageSize).lean();
  await db.disconnect();

  return {
    props: {
      promotion: JSON.parse(JSON.stringify(promotion)),
      pages: Math.ceil(allpromotion.length / pageSize),
    },
  };
}
