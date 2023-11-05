/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import React, {useState} from 'react';

export default function ProductItem({ product, addToCartHandler }) {
  let [quantity, setQuantityProduct] = useState(0)

  return (
    <div className="product-card w-56 h-96 shadow-lg rounded-xl">
      
        <div>
        <Link href={`/product/${product.slug}`} passHref>
        <div className='flex w-full justify-center items-center'>
          <img
            src={product.image[0]}
            alt={product.name}
            className="rounded shadow object-cover h-48 "
          />
        </div>
        </Link>
      <div className="flex flex-col items-center justify-center p-2 ">
        <Link href={`/product/${product.slug}`}>
          <a>
            <h2 className="text-lg product-name text-center font-mono font-extrabold  hover:font-bold capitalize">{product.name.length > 45 ?(product.name.slice(0,45).split(' ').slice(0,-1).join(' ').concat(" ...")):(product.name) }</h2>
          </a>
        </Link>
        
        {product.countInStock >0 ?(
          <div> 
        <p className="text-2xl product-name font-mono font-extrabold  hover:font-bold capitalize ml-4">TND {product.price}</p>
            <div className="h-9 w-28 bg-white border-[#079afc65] border-2 flex justify-center">
              <button onClick={()=>{if (quantity >1){setQuantityProduct(quantity-=1)}}} className='w-16'>
                <div className='moins-button cursor-pointer w-4 ml-2' ></div>
              </button>
              <input
                className="w-10"
                value={quantity}
                id="quantity"
                onChange={ (e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  value = value.slice(0, 4);
                  e.target.value = value; 
                  setQuantityProduct(value)
                }}
                />
              <button onClick={()=>{if(quantity < product.countInStock) {setQuantityProduct(quantity+=1)}}} className=''>
                <div className='plus-button cursor-pointer ' ></div>
              </button>
          </div>
          </div>
          ):(
            <h1 className='text-xl text-[#FF0011]'> Product Out of Stock</h1>
          )}
          
        <button
          className="primary-button button-product"
          type="button"
          onClick={() => addToCartHandler(product, quantity)}
        >
           <div className='flex gap-2'>
            <h1 className=''>Add to cart</h1>
            <div className='shopping-bag h-6 w-6'></div>
          </div>
        </button>
        
      </div>
      </div>
  
    </div>
  );
}
