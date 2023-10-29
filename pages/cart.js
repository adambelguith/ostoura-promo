import Image from 'next/image';
import Link from 'next/link';
import React, { useContext } from 'react';
import { XCircleIcon } from '@heroicons/react/outline';
import Layout from '../components/Layout';
import { Store } from '../utils/Store';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { toast } from 'react-toastify';

function CartScreen() {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const removeItemHandler = (item) => {
    dispatch({ type: 'CART_REMOVE_ITEM', payload: item });
  };
  const updateCartHandler = async (item, qty) => {
    const quantity = Number(qty);
    const { data } = await axios.get(`/api/products/${item._id}`);
    if (data.countInStock < quantity) {
      return toast.error('Sorry. Product is out of stock');
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...item, quantity } });
  };
  return (
    <Layout title="Shopping Cart">
      <h1 className="mb-4 text-xl">Shopping Cart</h1>
      {cartItems.length === 0 ? (
      <div >
        <div>
          Cart is empty. <p className='text-blue-500'><Link href="/">Go shopping</Link></p>
        </div>
        <div className='flex w-full justify-center items-center mt-32 ' >
          <div className='flex'>
        <h1 className='relative text-2xl left-32 lg:left-64 text-blue-900 top-12 font-black whitespace-nowrap'> EMPTY !</h1>
          <img src="https://img.icons8.com/3d-fluency/375/shopping-cart.png" className='relative right-24 lg:left-0' alt="shopping-cart" />
          </div>
        </div>
      </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-10">
          <div className="overflow-x-auto md:col-span-3">
            <table className="min-w-full ">
              <thead className="border-b">
                <tr>
                  <th className="p-5 text-left">Item</th>
                  <th className="p-5 text-right">Quantity</th>
                  <th className="p-5 text-right">Price</th>
                  <th className="p-5">Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.slug} className="border-b items-cart h-64 md:h-32 mb-6 ">
                    <td>
                      <Link href={`/product/${item.slug}`}>
                        <a className="flex flex-col md:flex-row  items-center ">
                          <Image
                            src={item.image[0]}
                            alt={item.name}
                            width={124}
                            height={84}
                            className='image-cart'
                          ></Image>
                          &nbsp;
                          <div className='text-lg product-name font-mono font-extrabold ml-6'>{item.name.length > 50 ?(item.name.slice(0,50).split(' ').slice(0,-1).join(' ').concat(" ...")):(item.name) }</div>
                        </a>
                      </Link>
                    </td>
                    <td className="p-5 text-right">
                      <select
                        value={item.quantity}
                        onChange={(e) =>
                          updateCartHandler(item, e.target.value)
                        }
                      >
                        {[...Array(item.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className=""> <div className='flex flex-col'>
                      <div className='flex text-center ml-6'>
              <span className="text-sm line-through mt-[4px]">
                {item.price}  
              </span>
              {item.promotion >15  ? (
                <span className='text-red-600 ml-2'> {parseFloat((item.price - ((item.price*item.promotion)/100)).toFixed(2))} </span>
                ):( 
                <span className='ml-2'>{parseFloat((item.price - ((item.price*15)/100)).toFixed(2))}</span> 
              )}
              <span className='ml-2'>TND</span>
              </div>
              <span className='text-center mr-6'>Remise {item.promotion > 15? ( item.promotion):(15) }% </span>
              </div>
              </td>
                    <td className="p-5 text-center">
                      <button onClick={() => removeItemHandler(item)}>
                        <XCircleIcon className="h-5 w-5"></XCircleIcon>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card p-5">
            <ul>
            {cartItems.map((item, index) => (
              <li className='flex p-2' key={index}>
                        <div className='h-24 mr-6 mt-2'>
                          <Image
                            src={item.image[0]}
                            alt={item.name}
                            width={64}
                            height={64}
                            className='image-cart mr-6'
                          ></Image>
                          </div>
                          <div className='flex flex-col'>
                          <div className=" text-lg">
                {item.name.length > 25 ?(item.name.slice(0,25).split(' ').slice(0,-1).join(' ').concat(" ...")):(item.name)} :
              </div>
              <div className='flex '>
              <span className="text-sm line-through mt-[4px]">
                {item.price}  
              </span>
              {item.promotion >15  ? (
                <span className='text-red-600 ml-2'> {parseFloat((item.price - ((item.price*(item.promotion ?(item.promotion):(15)))/100)).toFixed(2))} TND</span>
                ):( 
                <span className='ml-2'>{parseFloat((item.price - ((item.price*15)/100)).toFixed(2))} TND</span> 
              )}
              </div>
              </div>
            </li>
            ))}
              <li>
                <div className=" text-2xl">
                  Total ({cartItems.reduce((a, c) => a + c.quantity, 0)}) :
                  {parseFloat((cartItems.reduce((a, c) => a + c.quantity *  (c.price - ((c.price*(c.promotion ?(c.promotion):(15))/100))), 0).toFixed(2)))} TND
                </div>
              </li>     
              <li>
              <button
                  onClick={() => router.push('/shipping')}
                  className="primary-button button-cart"
                >
                  Check Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default dynamic(() => Promise.resolve(CartScreen), { ssr: false });
