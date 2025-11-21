'use client';

import Link from 'next/link';
import { ModeToggle } from '@/components/ui/button-theme';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import './styles/landing.css';

type Item = {
  id_comix: string;
  dis_comix: string;
};

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string>('');
  const [appName, setAppName] = useState('comixverse');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
        const envAppName = process.env.NEXT_PUBLIC_APP_NAME || 'DefaultAppName';
        localStorage.setItem('appName', envAppName);
        setAppName(envAppName);
  }, []);

  useEffect(() => {
    fetch('/api/mysql-config/route_landing')
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to fetch');
        }
        return res.json();
      })
      .then((data: Item[]) => setItems(data))
      .catch((err) => setError(err.message));
  }, []);

  // Pause animation when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-white transition-colors duration-300 px-6 relative overflow-hidden">
      {/* Background scrolling comics */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 10 }).map((_, rowIndex) => {
          // Limit to 30 images per row for better performance
          const shuffledItems = [...items]
            .sort(() => 0.5 - Math.random())
            .slice(0, 30);
          const duplicatedItems = [...shuffledItems, ...shuffledItems];

          // Add animation pause via class when tab not visible
          const animationClass = isVisible ? (rowIndex % 2 === 0 ? 'scroll-left' : 'scroll-right') : 'animation-paused';

          return (
            <div
              key={rowIndex}
              className={`scrolling-row ${animationClass} px-3 py-1 flex items-center`}
              style={{ willChange: 'transform' }}
            >
              {duplicatedItems.map(
                (item, i) =>
                  item?.dis_comix && (
                    <a
                      key={`${rowIndex}-${i}`}
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mx-1 flex-shrink-0"
                    >
                      <Image
                        src={item.dis_comix}
                        alt={`Comic ${i + 1}`}
                        width={324}
                        height={500}
                        className="h-[100px] w-auto object-cover rounded-lg opacity-40 hover:opacity-100 transition duration-300"
                        loading="lazy"
                        draggable="false"
                      />
                    </a>
                  )
              )}
            </div>
          );
        })}
      </div>

      {/* Foreground content */}
      <div className="relative z-10 max-w-full">
        {/* Navbar */}
        <nav className="flex justify-between items-center py-6 max-w-full mx-auto">
          <div className="flex items-center gap-2">
            <Image src="/favicon.ico" alt="Logo" className="size-8" width={20} height={20} />
            <div className="text-2xl font-bold uppercase">
              {appName}
            </div>
          </div>
          <div className="hidden md:flex gap-8">{/* Add desktop-only links here if needed */}</div>
          <MobileMenu />
        </nav>

        {/* Hero Section */}
        <section className="text-center mt-24 max-w-3xl mx-auto px-4 md:px-0">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Bringing comixs
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              straight to your screen.
            </span>
          </h1>
          <p className="mt-6 font-semibold md:text-lg text-black dark:text-white capitalize">
            {appName} is your ultimate digital comic library with dark mode, easy browsing, and fast updates.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link
              href="#"
              className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-300"
            >
              GitHub Link
            </Link>
            <Link
              href="dashboard"
              className="px-6 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-300"
            >
              See a Demo
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// Mobile menu with burger toggle, only visible on mobile
function MobileMenu() {
    const [open, setOpen] = useState(false);
  
    return (
      <div className="relative flex items-center gap-4">
        {/* Desktop buttons */}
        <div className="hidden md:flex gap-4 items-center">
          <Link
            href="/signin"
            className="px-4 py-2 text-sm md:text-base bg-black text-white rounded-full hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-300 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="#"
            className="px-4 py-2 text-sm md:text-base bg-black text-white rounded-full hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-300 transition-colors"
          >
            Sign up
          </Link>
          <ModeToggle />
        </div>
  
        {/* Mobile burger button */}
        <button
          className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6 text-gray-900 dark:text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 8h16M4 16h16" />
            )}
          </svg>
        </button>
  
        {/* Mobile dropdown with transition */}
        <div
          className={`
            absolute top-full right-0 mt-1 w-40 bg-white dark:bg-black rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-20
            transform origin-top-right
            transition-all duration-200 ease-out
            ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
          `}
        >
          <Link
            href="/signin"
            className="block px-4 py-2 mb-1 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            onClick={() => setOpen(false)}
          >
            Sign in
          </Link>
          <Link
            href="#"
            className="block px-4 py-2 mb-2 text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            onClick={() => setOpen(false)}
          >
            Sign up
          </Link>
          <div className="flex justify-end px-4 pb-2">
            <ModeToggle />
          </div>
        </div>
      </div>
    );
}
  
  
