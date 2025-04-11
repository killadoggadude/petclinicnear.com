import React from 'react';
import Head from 'next/head';
import Breadcrumbs from './Breadcrumbs'; // Assuming Breadcrumbs is in the same folder

export default function StaticPageLayout({ title, description, children }) {
  
  // Simple breadcrumb structure for static pages
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: title, href: null }, // Current page uses the title
  ];

  return (
    <>
      <Head>
        <title>{`${title} - DirectoryTemplate`}</title>
        <meta name="description" content={description || `Learn more about ${title} at DirectoryTemplate.`} />
      </Head>

      {/* Page Header */} 
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 py-8 px-4 border-b border-gray-300">
         <div className="container mx-auto max-w-7xl">
             <Breadcrumbs crumbs={breadcrumbs} />
             <h1 className="text-3xl md:text-4xl font-bold mt-2">{title}</h1>
         </div>
      </div>

      {/* Main Content Area */} 
      <div className="container mx-auto px-4 py-12 max-w-4xl"> {/* Max width for text content */}
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
            {/* Prose styles for better text formatting */}
            <div className="prose prose-lg max-w-none">
                 {children} 
            </div>
        </div>
      </div>
    </>
  );
} 