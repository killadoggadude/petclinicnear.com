import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { getProcessedData } from '../../lib/data'; // Import data helper
import ListingCard from '../../components/ListingCard'; // Import ListingCard

// Dynamically import components if needed (though less critical if pages are static)
const Breadcrumbs = dynamic(() => import('../../components/Breadcrumbs'), { ssr: false });

// Build-time path generation for states
export async function getStaticPaths() {
  const data = getProcessedData();
  const allItems = data.allItems || [];

  const stateCounts = {};
  allItems.forEach(item => {
    const stateName = item.state || 'Unknown State';
    if (stateName !== 'Unknown State') {
      stateCounts[stateName] = (stateCounts[stateName] || 0) + 1;
    }
  });

  const paths = Object.keys(stateCounts).map(stateName => ({
    params: { stateSlug: stateName.toLowerCase().replace(/\s+/g, '-') }, // Generate slug
  }));

  return { paths, fallback: false }; // Use fallback: false if all paths are generated
}

// Build-time data fetching for a specific state
export async function getStaticProps({ params }) {
  const data = getProcessedData();
  const { stateSlug } = params;

  // Find state name from slug (more robustly)
  const stateName = Object.keys(data.allItems.reduce((acc, item) => {
    if (item.state) acc[item.state] = true;
    return acc;
  }, {})).find(name => name.toLowerCase().replace(/\s+/g, '-') === stateSlug);

  if (!stateName) {
    return { notFound: true }; // State not found
  }

  // Filter items belonging to this state
  const stateItems = data.allItems.filter(item => item.state === stateName);

  // Sort items (optional, e.g., by rating or name)
  stateItems.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.name.localeCompare(b.name));

  const totalItemCount = stateItems.length;

  return {
    props: {
      stateName: stateName,
      items: JSON.parse(JSON.stringify(stateItems)), // Pass items for this state
      totalItemCount: totalItemCount,
    },
  };
}

// State Page Component
export default function StatePage({ stateName, items, totalItemCount }) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20; // Or your desired number

  // --- Pagination Logic --- 
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0); // Scroll to top on page change
    }
  };
  // --- End Pagination Logic ---

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'All States', href: '/states' },
    { name: stateName, href: null }, // Current state
  ];

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Pet Clinics in {stateName} - {totalItemCount} Listings | Pet Clinic Directory</title>
        <meta name="description" content={`Find the best ${totalItemCount} pet clinics and veterinarians in ${stateName}. Browse listings, ratings, and contact information.`} />
        {/* Add canonical URL if needed */}
        {/* <link rel="canonical" href={`https://petclinicnear.com/${stateName.toLowerCase().replace(/\s+/g, '-')}`} /> */}
      </Head>

      {/* Top Hero (Breadcrumbs only) */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 py-8 px-4 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl">
          <Breadcrumbs crumbs={breadcrumbs} />
          <h1 className="block text-lg md:text-xl font-medium mt-2 text-gray-700">
            {totalItemCount} {totalItemCount === 1 ? 'Pet Clinic' : 'Pet Clinics'} in {stateName}
          </h1>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white py-10 px-4 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800">The Top {totalItemCount} Pet Clinics in {stateName}</h2>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the best veterinary services in {stateName}. Our directory features top-rated clinics known for quality care.
          </p>
        </div>
      </div>

      {/* Main Content Area */} 
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <main className="w-full">
          {/* Optional: Add search/filter bar here if needed later */}
          {/* <SearchFilterBar ... /> */} 
          
          <p className="mb-6 text-gray-600">
            Showing {paginatedItems.length} of {totalItemCount} listings found in {stateName}.
          </p>

          {items.length > 0 ? (
            <>
              {/* Grid for listing cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedItems.map((item) => (
                  <ListingCard key={`${item.citySlug}-${item.slug}`} item={item} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-md bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &larr; Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-md bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 py-10">
              No listings found for {stateName}.
            </p>
          )}
        </main>
      </div>
    </>
  );
} 