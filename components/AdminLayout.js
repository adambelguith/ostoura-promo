import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  ChartPieIcon, 
  ShoppingCartIcon, 
  UserGroupIcon, 
  ViewGridIcon,
  MenuIcon,
  XIcon,
  CogIcon,
  LogoutIcon,
  FolderIcon,
  BellIcon,
  UserCircleIcon,
  SearchIcon
} from '@heroicons/react/outline';
import { useSession, getSession, signOut } from 'next-auth/react';

export default function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Handle route changes
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      setIsOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Check session status
    if (status === 'loading') return; // Wait for session to load

    // If no session, redirect to login
    if (!session) {
      router.push('/login');
      return;
    }

    // If session exists but user is not admin or seller, redirect to home
    if (session.user.role !== 'admin' && session.user.role !== 'seller') {
      router.push('/');
    }
  }, [session, status, router]);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: ChartPieIcon,
      path: '/admin/dashboard',
    },
    {
      title: 'Orders',
      icon: ShoppingCartIcon,
      path: '/admin/orders',
    },
    {
      title: 'Products',
      icon: ViewGridIcon,
      path: '/admin/products',
    },
    {
      title: 'Categories',
      icon: FolderIcon,
      path: '/admin/categories',
    },
    {
      title: 'Users',
      icon: UserGroupIcon,
      path: '/admin/users',
    },
    {
      title: 'Settings',
      icon: CogIcon,
      path: '/admin/settings',
    }
  ];

  // Handle logout
  const handleLogout = async () => {
    await signOut({ redirect: false }); // Sign out without redirecting
    router.push('/auth/login'); // Redirect to login page
  };

  // If session is loading, show a loading indicator
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If user is not authorized, return null (they will be redirected)
  if (session?.user.role !== 'admin' && session?.user.role !== 'seller') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 ease-in-out z-20
          ${isOpen ? 'w-64' : 'w-20'} 
          ${isMobile && !isOpen && '-translate-x-full'}
          ${isMobile && 'w-[280px]'}`}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          {(isOpen || isMobile) && (
            <Link href="/admin/dashboard">
              <a className="flex items-center space-x-3">
                <img src="/logo.png" alt="Logo" className="w-8 h-8" />
                <span className="text-xl font-bold text-gray-800 dark:text-white">Admin</span>
              </a>
            </Link>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-5 px-3 space-y-1">
          {menuItems.map((item, index) => (
            <MenuItem 
              key={index}
              item={item}
              isOpen={isOpen || isMobile}
              currentPath={router.pathname}
            />
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 w-full border-t border-gray-200 dark:border-gray-700">
          {/* User Profile */}
          <div className="p-4">
            <div className={`flex items-center ${isOpen || isMobile ? 'space-x-3' : 'justify-center'}`}>
              <UserCircleIcon className="w-8 h-8 text-gray-400" />
              {(isOpen || isMobile) && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {session?.user?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {session?.user?.email || 'admin@example.com'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`flex items-center w-full p-4 text-gray-600 dark:text-gray-400 
              hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
              ${isOpen || isMobile ? 'justify-start space-x-3' : 'justify-center'}`}
          >
            <LogoutIcon className="w-5 h-5" />
            {(isOpen || isMobile) && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className={`transition-all duration-300 
          ${isOpen && !isMobile ? 'ml-64' : 'ml-0 lg:ml-20'}`}
      >
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 shadow">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <MenuIcon className="w-6 h-6" />
              </button>
            )}

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                />
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative">
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden">
                <UserCircleIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function MenuItem({ item, isOpen, currentPath }) {
  const isActive = currentPath === item.path;
  const Icon = item.icon;

  return (
    <Link href={item.path}>
      <a 
        className={`flex items-center px-3 py-3 rounded-lg transition-colors
          ${isActive 
            ? 'bg-blue-500 text-white' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}
          ${!isOpen && 'justify-center'}`}
      >
        <Icon className={`w-6 h-6 ${!isOpen && 'mx-auto'}`} />
        {isOpen && <span className="ml-3">{item.title}</span>}
      </a>
    </Link>
  );
}

// Server-side check for session and role
export async function getServerSideProps(context) {
  const session = await getSession(context);

  // If no session, redirect to login
  if (!session) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: false,
      },
    };
  }

  // If session exists but user is not admin or seller, redirect to home
  if (session.user.role !== 'admin' && session.user.role !== 'seller') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // If user is authorized, proceed
  return {
    props: { session },
  };
} 