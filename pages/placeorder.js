"use client";
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import { getError } from '../utils/error';
import { Store } from '../utils/Store';

export default function PlaceOrderScreen() {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;
  // const { cartItems, shippingAddress, paymentMethod } = cart;
  const testCart = Cookies.get('cart');
  const [session, setSession] = useState();
  useEffect(() => {
    if(testCart){
      setSession(JSON.parse(testCart))
    }
}, []);

const cartItems = session?.cartItems
const shippingAddress = session?.shippingAddress
const paymentMethod = session?.paymentMethod


   const itemsPrice =  cartItems ? cartItems.reduce((a, c) => a + c.quantity * c.price, 0) : 0;
   const shippingPrice = itemsPrice > 200 ? 0 : 8;
   const totalPrice = itemsPrice + shippingPrice;

   const router = useRouter();

  const [loading, setLoading] = useState(false);

  const placeOrderHandler = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/orders', {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        totalPrice,
      });
      setLoading(false);
      dispatch({ type: 'CART_CLEAR_ITEMS' });
      Cookies.set(
        'cart',
        JSON.stringify({
          ...cart,
          cartItems: [],
        })
      );
      router.push(`/order/${data._id}`);
    } catch (err) {
      setLoading(false);
      toast.error(getError(err));
    }
  };

  return (
    <Layout title="Place Order">
      <CheckoutWizard activeStep={2} />
      <h1 className="mb-4 text-xl">Place Order</h1>
      {cartItems?.length !=0  ? (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <div className="card  p-5">
              <h2 className="mb-2 text-lg">Shipping Address</h2>
              <div>
                {shippingAddress ? shippingAddress.fullName : ''}, { shippingAddress ? shippingAddress.address: ''},{' '}
                {shippingAddress ? shippingAddress.city :''}, {shippingAddress ? shippingAddress.postalCode:''},{' '}
                {shippingAddress ? shippingAddress.country : ''}
              </div>
              <div>
                <Link href="/shipping"><span className='text-blue-700 cursor-pointer'>Edit</span></Link>
              </div>
            </div>
            <div className="card  p-5">
              <h2 className="mb-2 text-lg">Payment Method</h2>
              <div>{paymentMethod}</div>
              <div>
                <Link href="/payment"><span className='text-blue-700 cursor-pointer'>Edit</span></Link>
              </div>
            </div>
            <div className="card overflow-x-auto p-5">
              <h2 className="mb-2 text-lg">Order Items</h2>
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                  <th className="px-5 text-left">Image</th>
                    <th className="px-5 text-left">Item</th>
                    <th className="    p-5 text-right">Quantity</th>
                    <th className="  p-5 text-right">Price</th>
                    <th className="p-5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems?.map((item) => (
                    <tr key={item._id} className="border-b">
                      <td>
                        <Link href={`/product/${item.slug}`} className="flex items-center">
                          <div className='cursor-pointer'>
                          <Image
                            src={item.image[0]}
                            alt={item.name}
                            width={50}
                            height={50}
                            ></Image>
                          </div>
                        </Link>
                      </td>
                      <td>
                        <Link href={`/product/${item.slug}`} className="flex items-center">
                          <div className='text-blue-500 cursor-pointer'>
                          {item.name.length > 100 ?(item.name.slice(0,100).split(' ').slice(0,-1).join(' ').concat(" ...")):(item.name)}
                          </div>
                        </Link>
                      </td>
                      <td className=" p-5 text-right">{item.quantity}</td>
                      <td className="p-5 text-right">${item.price}</td>
                      <td className="p-5 text-right">
                        ${item.quantity * item.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <Link href="/cart"><span className='text-blue-700 cursor-pointer'>Edit</span></Link>
              </div>
            </div>
          </div>
          <div>
            <div className="card  p-5">
              <h2 className="mb-2 text-lg">Order Summary</h2>
              <ul>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Items</div>
                    <div>${itemsPrice}</div>
                  </div>
                </li>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Shipping</div>
                    <div>${shippingPrice}</div>
                  </div>
                </li>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Total</div>
                    <div>${totalPrice}</div>
                  </div>
                </li>
                <li>
                  <button
                    disabled={loading}
                    onClick={placeOrderHandler}
                    className="button-cart w-full"
                  >
                    {loading ? 'Loading...' : 'Place Order'}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div>
          Cart is empty. <Link href="/"><span className='text-blue-700 cursor-pointer'>Go shopping</span></Link>
        </div>
      )}
    </Layout>
  );
}

PlaceOrderScreen.auth = true;
