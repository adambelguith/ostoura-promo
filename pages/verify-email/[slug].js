
import React from 'react';
import Layout from '../../components/Layout';
import User from '../../models/User';
import db from '../../utils/db';
import Link from 'next/link';


export default function VerifieScreen(props) {
 const user = props;
  return (
    <Layout title={"vérifier account"}>
        {user ?(<div className='flex flex-col items-center justify-center mt-24 lg:mt-64 gap-12 '>
        <p className='text-center text-2xl text-[#089203] '>votre courrier est vérifié maintenant!</p>
        <Link href='/' className='text-center text-white ' passHref>
            <div className='h-12 w-24 bg-blue-600 rounded-lg '>
                <p className='pt-2'>
                    Home 
                </p>
            </div>
        </Link>
      </div>): (
      <div className='flex flex-col items-center justify-center mt-24 lg:mt-64 gap-12 '>
         
    </div>
        )}
      

    </Layout>
  );
}


export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;
  await db.connect();
  const user = await User.findById(slug);
  if (user) {
    user.isActivated = true; 
    await user.save();
  await db.disconnect();

  return {
    props: {
      user: user ? JSON.parse(JSON.stringify(user)) : null,
    },
  };
}
return  {
    props: {
      user: null,
    },
  };
}


