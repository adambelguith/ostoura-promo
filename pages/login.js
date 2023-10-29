import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import Layout from '../components/Layout';
import { getError } from '../utils/error';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function LoginScreen() {
  const { data: session } = useSession();
  const [error, setError] = useState('');
  const [isSignedUp, setIsSignedUp] = useState(false);
  const router = useRouter();
  const { redirect } = router.query;

useEffect(()=>{
  if (session && !isSignedUp) {
    const { name, email } = session.user;
    axios
      .post('/api/auth/signupgoogle', {
        name,
        email,
      })
      .then(() => {
        setIsSignedUp(true); 
      })
  }
},[session,isSignedUp])

  useEffect(()  => {    
    if (session?.user) {
      router.push(redirect || '/');
    }
  }, [router, session, redirect]);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();
  const submitHandler = async ({ email, password }) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (result.error) {
        toast.error(result.error);
        setError(result.error);
      }
    } catch (err) {
      toast.error(getError(err));
      setError(err);
    }
  };
  const handleGoogleSignIn = async () => {
   await signIn('google');
  };
  return (
    <Layout title="Login">
      <form
        className="mx-auto max-w-screen-md"
        onSubmit={handleSubmit(submitHandler)}
      >
        <h1 className="mb-4 text-xl">Login</h1>
        {error && <p className="invalidlogin">{error}</p>}
        <div className="mb-4">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            {...register('email', {
              required: 'Please enter email',
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$/i,
                message: 'Please enter valid email',
              },
            })}
            className="w-full"
            id="email"
            autoFocus
          ></input>
          {errors.email && (
            <div className="text-red-500">{errors.email.message}</div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            {...register('password', {
              required: 'Please enter password',
              minLength: { value: 6, message: 'password is more than 5 chars' },
            })}
            className="w-full"
            id="password"
          ></input>
          {errors.password && (
            <div className="text-red-500 ">{errors.password.message}</div>
          )}
        </div>
       
        <div className="mb-4 ">
          <button className="primary-button">Login</button>
        </div>
        <div className="mb-4 ">
          Don&apos;t have an account? &nbsp;
          <h1 className='text-blue-600'><Link href={`/register`}>Register</Link></h1>
        </div>
      </form>
      <div className='flex w-full justify-center items-center mb-6'>
        <button onClick={handleGoogleSignIn} className='flex items-center gap-4 shadow-xl rounded-lg pl-3'>
          <img src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/v1695820502/logo/google_gxukdz.png`} height={30} width={30} />
          <span className='bg-blue-500 text-white px-4 py-3'>sign in with google</span>
        </button>
      </div>
    </Layout>
  );
}
