import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';

// --- Footer Component --- 
function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-auto">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
           {/* Footer Logo - Reverted to white version */}
           <div className="mb-4 md:mb-0">
              <Link href="/">
                 <span className="cursor-pointer flex items-center">
                     <Image 
                       src="/images/logo-color-white.png"
                       alt="Directory Logo White" 
                       width={150}
                       height={0}
                       style={{ height: 'auto' }}
                       className="max-w-[120px] sm:max-w-[150px]"
                     />
                 </span>
              </Link>
           </div>
           {/* Footer Links */}
           <nav className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-2 text-sm mb-4 md:mb-0">
               <Link href="/about"><span className="hover:text-primary cursor-pointer">About</span></Link>
               <Link href="/contact"><span className="hover:text-primary cursor-pointer">Contact</span></Link>
               <Link href="/terms"><span className="hover:text-primary cursor-pointer">Terms of Service</span></Link>
               {/* Add other footer links as needed */}
           </nav>
        </div>
         {/* Copyright */}
        <div className="text-center text-gray-400 text-sm mt-6 pt-6 border-t border-gray-700">
          &copy; {currentYear} Directory. All rights reserved.
        </div>
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; {new Date().getFullYear()} Directory. All rights reserved.
          </p>
          {/* Add Sitemap Link */}
          <p className="text-center text-xs leading-5 text-gray-500 mt-1">
            <Link href="/sitemap.xml">
              <span className="hover:text-gray-700 hover:underline">Sitemap</span>
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        {/* Default Head tags - can be overridden by pages */}
        <title>Directory Template</title>
        <meta name="description" content="A generic directory built with Next.js" />
        <link rel="icon" href="/favicon.ico" />
        {/* START: Add SEO Meta Tags */}
        {/* OG Defaults */}
        <meta property="og:site_name" content="Pet Clinic Directory" />
        <meta property="og:type" content="website" />
        {/* Update placeholder URL comment */}
        {/* <meta property="og:image" content="https://petclinicnear.com/images/logo-og.png" /> */}
        {/* Twitter Card Defaults */}
        <meta name="twitter:card" content="summary" />
        {/* Update placeholder URL comment */}
        {/* <meta name="twitter:image" content="https://petclinicnear.com/images/logo-og.png" /> */}
        {/* END: Add SEO Meta Tags */}
        {/* Added Google Font Import for Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Favicon links - Ensure paths are correct */}
        <link rel="icon" href="/images/favicon.png" sizes="any" /> 
        {/* <link rel="icon" href="/images/favicon.svg" type="image/svg+xml" /> */}
        {/* <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" /> */}
        {/* Add Google Site Verification */}
        <meta name="google-site-verification" content="vzbpQPeUWm7YRuYMecsOutD7aEuwFDy9mGyvSrkbxfg" />
      </Head>

      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-7xl">
          {/* Logo/Site Title - Adjusted */}
          <div className="flex items-center">
            <Link href="/">
              <span className="cursor-pointer flex items-center">
                 {/* Logo Image - Adjusted */}
                 <Image 
                   src="/images/logo-color.png" 
                   alt="Directory Logo" 
                   width={150}
                   height={0}
                   style={{ height: 'auto' }}
                   className="max-w-[120px] sm:max-w-[150px]"
                   priority
                 />
              </span>
            </Link>
          </div>

          {/* Combined Mobile Actions (Menu + Search) */}
          <div className="md:hidden flex items-center gap-2">
             {/* Search Toggle Button (Mobile) */}
             <button 
              onClick={toggleSearch}
              className="text-gray-600 hover:text-primary focus:outline-none p-2 rounded-md"
              aria-label="Toggle Search"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-primary focus:outline-none p-2 rounded-md"
            >
              {/* Hamburger Icon */} 
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
             {/* Increase font size, adjust padding slightly */}
             <Link href="/">
               <span className="text-gray-700 hover:bg-gray-100 hover:text-primary px-4 py-2 rounded-md text-base font-medium cursor-pointer transition-colors duration-150">Home</span>
             </Link>
             {/* Remove All States Link */}
             {/* <Link href="/states"> ... </Link> */}
             {/* Keep All Cities Link, update text */}
             <Link href="/cities">
               <span className="text-gray-700 hover:bg-gray-100 hover:text-primary px-4 py-2 rounded-md text-base font-medium cursor-pointer transition-colors duration-150">Best Pet Clinics by City</span>
             </Link>
             {/* Remove All Categories Link */}
             {/* 
             <Link href="/categories">
               <span className="text-gray-700 hover:bg-gray-100 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-150">All Categories</span>
             </Link>
             */}
             <Link href="/about">
               <span className="text-gray-700 hover:bg-gray-100 hover:text-primary px-4 py-2 rounded-md text-base font-medium cursor-pointer transition-colors duration-150">About</span>
             </Link>
             <Link href="/contact">
               <span className="text-gray-700 hover:bg-gray-100 hover:text-primary px-4 py-2 rounded-md text-base font-medium cursor-pointer transition-colors duration-150">Contact</span>
             </Link>
             {/* Search Toggle Button (Desktop) */}
             <button 
              onClick={toggleSearch}
              className="text-gray-600 hover:text-primary focus:outline-none p-2 rounded-md ml-2" 
              aria-label="Toggle Search"
            >
               <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
               </svg>
            </button>
          </nav>
        </div>

        {/* Mobile Menu Dropdown */} 
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/">
                <span onClick={toggleMobileMenu} className="text-gray-700 hover:bg-gray-100 hover:text-primary block px-3 py-2 rounded-md text-base font-medium cursor-pointer transition-colors duration-150">Home</span>
              </Link>
              {/* Remove All States Link */}
              {/* <Link href="/states"> ... </Link> */}
              {/* Keep All Cities Link, update text */}
              <Link href="/cities">
                <span onClick={toggleMobileMenu} className="text-gray-700 hover:bg-gray-100 hover:text-primary block px-3 py-2 rounded-md text-base font-medium cursor-pointer transition-colors duration-150">Best Pet Clinics by City</span>
              </Link>
              {/* Remove All Categories Link */}
              {/* 
              <Link href="/categories">
                <span onClick={toggleMobileMenu} className="text-gray-700 hover:bg-gray-100 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium cursor-pointer transition-colors duration-150">All Categories</span>
              </Link>
              */}
              <Link href="/about">
                <span onClick={toggleMobileMenu} className="text-gray-700 hover:bg-gray-100 hover:text-primary block px-3 py-2 rounded-md text-base font-medium cursor-pointer transition-colors duration-150">About</span>
              </Link>
              <Link href="/contact">
                <span onClick={toggleMobileMenu} className="text-gray-700 hover:bg-gray-100 hover:text-primary block px-3 py-2 rounded-md text-base font-medium cursor-pointer transition-colors duration-150">Contact</span>
              </Link>
            </nav>
          </div>
        )}

        {/* Search Bar Overlay */} 
        {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-t border-b border-gray-200 shadow-md z-40">
                <div className="container mx-auto px-4 py-3 max-w-7xl">
                   {/* Basic Search Form - Action points to homepage search */}
                   <form action="/" method="GET" className="flex gap-2">
                        <input 
                            type="search" 
                            name="q" // Use 'q' for query param like homepage
                            placeholder="Search listings..." 
                            className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-md font-medium">
                            Search
                        </button>
                        <button 
                            type="button"
                            onClick={toggleSearch} 
                            className="p-2 text-gray-500 hover:text-gray-700" 
                            aria-label="Close Search"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                   </form>
                </div>
            </div>
        )}

      </header>

      <main className="flex-grow bg-gray-50">
        {children}
      </main>

      <Footer /> 
    </div>
  );
} 