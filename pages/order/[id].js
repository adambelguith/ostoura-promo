
import axios from 'axios';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useReducer ,useState} from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { getError } from '../../utils/error';


function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    

    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false };
    case 'DELIVER_RESET':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };

    default:
      state;
  }
}
function OrderScreen() {

  const { query } = useRouter();
  const router = useRouter();
  const orderId = query.id;

  const [
    {
      loading,
      error,
      order,
      successDeliver,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
  });
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/${orderId}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    if (
      !order._id ||
      successDeliver ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
  
      if (successDeliver) {
        dispatch({ type: 'DELIVER_RESET' });
      }
    }
  }, [order, orderId, successDeliver]);
  const {
    shippingAddress,
    paymentMethod,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    
  } = order;


  
  async function deliverOrderHandler() {
    try {
    
  
      router.push('/')
      toast.success('Order is delivered');
    } catch (err) {

      toast.error(getError(err));
    }
  }
  
  const [productPerView, setProductPerView] = useState(false);
  useEffect(() => {

    function updateProductPerView() {
      if (window.innerWidth >= 1024) {
        setProductPerView(true);
      } else{
        setProductPerView(false);
      }
    }
    window.addEventListener('resize', updateProductPerView);
    updateProductPerView();
    return () => {
      window.removeEventListener('resize', updateProductPerView);
    };
  }, []);
  



  return (
    <Layout title={`Facture ${orderId}`}>
      <h1 className="mb-4 text-xl">{`Order ${orderId}`}</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <div className="card  p-5">
              <h2 className="mb-2 text-lg">Shipping Address</h2>
              <div className='flex flex-col md:flex-row'>
                <div >{shippingAddress.fullName}, </div>
                <div >{shippingAddress.address},{' '} </div>
                <div> {shippingAddress.city}, </div>
                <div >{shippingAddress.postalCode},{' '} </div>
                <div >{shippingAddress.phone} </div>
              </div>
              
            </div>

            <div className="card p-5">
              <h2 className="mb-2 text-lg">Payment Method</h2>
              <div>{paymentMethod}</div>
              
              
            </div>

            <div className="card overflow-x-auto p-5">
              <h2 className="mb-2 text-lg">Order Items</h2>
              <table className="min-w-full">
                <thead className="border-b">
                  <tr>
                  <th className="px-5 text-left"></th>
                    <th className="px-5 text-left">Item</th>
                    <th className=" p-5 text-right">Quantity</th>
                    <th className="  p-5 text-right">Price</th>
                    <th className="p-5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item._id} className="border-b">
                      <td>
                        <Link href={`/product/${item.slug}`}>
                          <a className="flex items-center">
                            <Image
                              src={item.image[0]}
                              alt={item.name}
                              width={50}
                              height={50}
                            ></Image>
                          </a>
                        </Link>
                      </td>
                      <td className='m-4'>
                        <div className='ml-4'>
                        <Link href={`/product/${item.slug}`}>
                          <a className="flex items-center">
                            {productPerView ? (
                             item.name
                            ):(item.name.length > 100 ?(item.name.slice(0,100).split(' ').slice(0,-1).join(' ').concat(" ...")):(item.name))}
                          </a>
                        </Link>
                        </div>
                      </td>
                      <td className=" p-5 text-right">{item.quantity}</td>
                      <td className="p-5 text-right">TND {item.price}</td>
                      <td className="p-5 text-right">
                        TND {parseFloat((item.quantity * item.price).toFixed(2))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div>
         
                  
            <div className="card  p-5">
              <h2 className="mb-2 text-lg">Order Summary</h2>
              <ul>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Items</div>
                    <div>TND {itemsPrice}</div>
                  </div>
                </li>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Tax</div>
                    <div>TND {taxPrice}</div>
                  </div>
                </li>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Shipping</div>
                    <div>TND {shippingPrice}</div>
                  </div>
                </li>
                <li>
                  <div className="mb-2 flex justify-between">
                    <div>Total</div>
                    <div>TND {parseFloat(totalPrice.toFixed(2))}</div>
                  </div>
                </li>
                
                  <li>
                    <button
                      className="button-cart w-full"
                      onClick={deliverOrderHandler}
                    >
                      Valide Facture 
                    </button>
                  </li>
                  <li>


                  
                </li>           
              </ul>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

OrderScreen.auth = true;
export default OrderScreen;

