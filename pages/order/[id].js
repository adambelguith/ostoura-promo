
import axios from 'axios';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useReducer ,useState} from 'react';
import { toast } from 'react-toastify';
import Layout from '../../components/Layout';
import { getError } from '../../utils/error';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import db from '../../utils/db'
import Order from '../../models/Order'
import User  from '../../models/User'
// import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
// import PdfDownload from '../../components/PdfDownload';

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
function OrderScreen({user}) {

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
  async function generateInvoicePDF() {
    try {
      function createPage(pdfDoc, pageNumber) {
        const page = pdfDoc.addPage([794, 1123]);
        const { width, height } = page.getSize();
      
        // Add page number
        page.drawText(`Page ${pageNumber}`, {
          x: 50,
          y: 50,
          size: 12,
        });
      
        return { page, width, height };
      }
      const pdfDoc = await PDFDocument.create();
      
  let pageNumber = 1;
  let { page, width, height } = createPage(pdfDoc, pageNumber);

      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      function createNewPage() {
        pageNumber++;
        ({ page, width, height } = createPage(pdfDoc, pageNumber));
        currentY = height - rowHeight - 100; 
      }
       const logoImageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/v1694431587/logo/logo_png_rvbzka.png`; 
      const response = await axios.get(logoImageUrl, { responseType: 'arraybuffer' });
      const logoImage = await pdfDoc.embedPng(response.data);
      page.drawImage(logoImage, {
        x: 50,
        y: height - 70,
        width: 100, 
        height: 50, 
      });
      page.drawText('Quincaillerie Ben Salah', {
        x: width - 600,
        y: height - 60,
        size: 28,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });

      page.drawText('Adresse: sayda, sousse, ksour essef \n Numero : 58 300 271 - 58 300 272 \n Mat Fisc : 1037441CBC000', {
        x: width - 300,
        y: height - 110,
        size: 16,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });

      page.drawText('Facture ', {
        x: 50,
        y: height - 120,
        size: 30,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });

      page.drawText(`Facture ID:  ${orderId}`, {
        x: 50,
        y: height - 140, 
        size: 16,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawRectangle({
        x: 50,
        y: height - 220,
        width: width - 500,
        height: 70, 
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
        borderRadi:80, 
      });
      page.drawText(`Client:    ${ user ? user.name: "Passager"}`, {
        x: 70, 
        y: height - 180, 
        size: 16,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(`Date :   ${order.createdAt.split('T')[0]}`, {
        x: 70, 
        y: height - 200, 
        size: 16,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
  

      
 const tableX = 50;
 const tableY = height - 300; 
 const tableWidth = width-15; 
 const rowHeight = 40;
 const cellPadding = 25; 
 const tableHeader = [' Article ', ' Qté ', ' Prix ' , ' Total '];

 const borderColor = rgb(0, 0, 0);
 const headerBackgroundColor = rgb(0.8, 0.8, 0.8);
 const cellBackgroundColor = rgb(0.95, 0.95, 0.95);

 const itemColumnWidth = 450;

const remainingColumnWidth  = ((tableWidth - itemColumnWidth) / (tableHeader.length - 1)) - 35;

let cellX = tableX + cellPadding -25;
var currentY = tableY - rowHeight;
const headerY = tableY + cellPadding + rowHeight / 2;

for (const [index, header] of tableHeader.entries()) {
  const columnWidth = index === 0 ? itemColumnWidth : remainingColumnWidth ;
  page.drawRectangle({
    x: cellX -2,
    y: tableY + 28,
    width: columnWidth,
    height: rowHeight,
    borderColor,
    color: headerBackgroundColor,
    borderWidth: 2,
  });

  page.drawText(header, {
    x: cellX + cellPadding / 2,
    y: headerY,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });
  cellX += columnWidth;
}
for (const item of order.orderItems) {
  cellX = tableX + cellPadding - 27;
  if (currentY - rowHeight < 50) {
    createNewPage(); 
  }
  for (const [index, value] of Object.entries([
    item.name.length > 80 ? (item.name.slice(0, 80).split(' ').slice(0, -1).join(' ').concat(" ...")) : (item.name),
    item.quantity.toString(),
    `${item.price.toString()}`,
    `${(item.quantity * item.price).toFixed(2).toString()}`,
  ])) {
    const columnWidth = index === '0' ? itemColumnWidth : remainingColumnWidth;
    page.drawRectangle({
      x: cellX,
      y: currentY + 26,
      width: columnWidth,
      height: rowHeight,
      borderColor,
      color: cellBackgroundColor,
      borderWidth: 1,
    });

    page.drawText(value, {
      x: cellX + cellPadding / 2, 
      y: currentY + cellPadding + rowHeight / 2,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
    cellX += columnWidth;
  }
    currentY -= rowHeight;
}

const totalText = ` ${parseFloat(order.totalPrice.toFixed(2)).toString()}`; 
page.drawText("Total : ", {
  x: tableX + 420,
  y: currentY +28 , 
  size: 30,
  font: helveticaFont,
  color: rgb(0, 0, 0),
});
 page.drawRectangle({
  x: tableWidth - (remainingColumnWidth *2) - 57,
  y: currentY+10 ,
  width: remainingColumnWidth * 2 ,
  height: rowHeight +15,
  borderColor,
  color: cellBackgroundColor,
  borderWidth: 1,
});


 page.drawText(totalText, {
   x: tableWidth - (remainingColumnWidth *2) - 20,
   y: currentY+ 25, 
   size: 24,
   font: helveticaFont,
   color: rgb(0, 0, 0),
 });

if (currentY < 250) {
  createNewPage(); 
}

page.drawText("Laivraison : ", {
  x: tableX +15,
  y: currentY-10 , 
  size: 30,
  font: helveticaFont,
  color: rgb(0, 0, 0),
});

page.drawRectangle({
  x: 50,
  y: currentY- 180,
  width: width - 300,
  height: 150, 
  borderColor: rgb(0, 0, 0),
  borderWidth: 0.5,
  borderRadi:80, 
});

 const addressText =`Nom: \t ${order.shippingAddress.fullName},
 Numéro: \t  ${order.shippingAddress.phone},
 Adresse: `;

const addressnom = ` \t \t \t \t ${order.shippingAddress.address},
\t \t \t ${order.shippingAddress.city},  ${order.shippingAddress.postalCode}.`
 page.drawText(addressText, {
   x: tableX +15,
   y: currentY- 50 , 
   size: 18,
   font: helveticaFont,
   color: rgb(0, 0, 0),
 });
 page.drawText(addressnom, {
  x: tableX +30,
  y: currentY- 97 , 
  size: 12,
  font: helveticaFont,
  color: rgb(0, 0, 0),
});



      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

      const pdfUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = `invoice_${orderId}.pdf`;
      downloadLink.click();

      toast.success('Facture générée avec succès');
    } catch (err) {
      toast.error(getError(err));
    }
  }



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
            <button
                    className="button-cart w-1/12 md:w-3/12 mt-5 "
                    onClick={generateInvoicePDF}
                  >
                    <div className='imprime relative right-6'></div>
                  </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

OrderScreen.auth = true;
export default OrderScreen;


export async function getServerSideProps({query}) {
  await db.connect();
 const order = query.id
  const orderId = await Order.findById(order)
  let user
  if(orderId.user){
    user = await User.findById(orderId.user)
  }

  return {
    props: {
      user: user? JSON.parse(JSON.stringify(user)) :null,
    },
  };
}
