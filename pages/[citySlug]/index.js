import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useMemo, useEffect } from 'react';
import fs from 'fs'
import path from 'path'
import Image from 'next/image'
import dynamic from 'next/dynamic'
// Ensure imports are up TWO levels
// import Breadcrumbs from '../../components/Breadcrumbs'
// import FilterSidebar from '../../components/FilterSidebar'
// import SearchFilterBar from '../../components/SearchFilterBar'

// Dynamically import ALL potentially client-side components
const Breadcrumbs = dynamic(() => import('../../components/Breadcrumbs'), { ssr: false });
const FilterSidebar = dynamic(() => import('../../components/FilterSidebar'), { ssr: false });
const SearchFilterBar = dynamic(() => import('../../components/SearchFilterBar'), { ssr: false });

// Helper function - Revert to reading cities
function getProcessedData() {
  const dataPath = path.join(process.cwd(), 'data', 'processed_data.json');
  try {
      const jsonData = fs.readFileSync(dataPath);
      const data = JSON.parse(jsonData);
      // Use the cities structure
      return {
          cities: data.cities || [], 
          allItems: data.allItems || [],
          categories: data.categories || [] // Keep for consistency
      };
  } catch (error) {
      console.error("Error reading processed data:", error);
      return { cities: [], allItems: [], categories: [] }; 
  }
}


// Build-time path generation - Use cities
export async function getStaticPaths() {
  // const data = getProcessedData(); // No longer need to read all data here
  // const paths = []; // No longer pre-generating paths
  // // Iterate through cities directly
  // data.cities.forEach(city => {
  //   if (city.slug) {
  //       paths.push({ params: { citySlug: city.slug } });
  //   }
  // });
  // Return an empty paths array and set fallback to 'blocking'
  return { paths: [], fallback: 'blocking' }
}

// Build-time data fetching - Use citySlug only
export async function getStaticProps({ params }) {
  const data = getProcessedData();
  const { citySlug } = params;

  // Find the current city directly
  const currentCityData = data.cities.find(c => c.slug === citySlug);
  if (!currentCityData) return { notFound: true };

  // Create a minimal city object to pass as props, excluding the large items array
  const minimalCity = {
    name: currentCityData.name,
    slug: currentCityData.slug,
    state: currentCityData.state || null, // Include state if available
    itemCount: currentCityData.items ? currentCityData.items.length : 0, // Calculate itemCount
    // DO NOT include currentCityData.items
  };

  return {
    props: {
      // Pass only the minimal city data
      city: JSON.parse(JSON.stringify(minimalCity)),
    },
  }
}


// City Page Component - Remove categories prop
export default function CityPage({ city }) {
  const router = useRouter()
  // Items will now be fetched client-side
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // const initialItems = city.items || []; // Remove reliance on initialItems from props
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedReviews, setSelectedReviews] = useState(0);

  // Fetch items client-side based on city slug
  useEffect(() => {
    if (city?.slug) {
      setIsLoading(true);
      setError(null);
      // In a real app, you'd fetch from an API endpoint
      // For now, we simulate by filtering the full dataset (less ideal but works)
      // NOTE: This still requires loading the full dataset client-side initially
      // A better approach is an API route: /api/cities/[citySlug]/items
      const fetchData = async () => {
        try {
            const allData = getProcessedData(); // Re-read data (inefficient, use API)
            const cityData = allData.cities.find(c => c.slug === city.slug);
            setItems(cityData?.items || []);
        } catch (err) {
            console.error("Error fetching items client-side:", err);
            setError("Failed to load listings.");
            setItems([]);
        } finally {
            setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [city?.slug]);

  // Filter items based on state - Now uses client-side 'items' state
  const filteredItems = useMemo(() => {
    let filtered = [...items]; // Use client-fetched items
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(lowerSearchTerm) ||
        item.street?.toLowerCase().includes(lowerSearchTerm) ||
        item.description?.toLowerCase().includes(lowerSearchTerm)
      );
    }
    if (selectedRating > 0) {
      filtered = filtered.filter(item => item.rating && item.rating >= selectedRating);
    }
    if (selectedReviews > 0) {
       filtered = filtered.filter(item => {
         const reviewCount = Number(item.reviews) || 0;
         return reviewCount >= selectedReviews;
      });
    }
    return filtered; // Return filtered client-fetched items
  }, [items, searchTerm, selectedRating, selectedReviews]);

  // Reset page to 1 when filters change - Remove selectedCategory
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRating, selectedReviews]);

  // ... pagination logic ...
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setCurrentPage(newPage);
          window.scrollTo(0, 0);
      }
  };

  // Uncomment breadcrumbs definition
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Cities', href: '/cities' }, 
    { name: city.name, href: null }, 
  ];

  if (router.isFallback) {
    return <div>Loading...</div>
  }

  // Check if city data is valid before trying to render anything complex
  if (!city) {
    return (
        <>
         <Head><title>Error</title></Head>
         <div>City data not found.</div>
        </>
    );
  }

  return (
    <>
      <Head>
        {/* Restore original title/meta */}
        <title>Pet Clinics in {`${city.name}${city.state ? `, ${city.state}`: ''} - Directory`}</title>
        <meta name="description" content={`Browse all Pet Clinics in ${city.name}${city.state ? `, ${city.state}`: ''}.`} />
      </Head>
      
      {/* Remove placeholder div */}
      {/* 
      <div className="container mx-auto p-10">
          <h1 className="text-2xl">City Page Test: {city.name}</h1>
          <p>If you see this without a hydration error, the problem is in the removed components/logic.</p>
      </div>
      */}

      {/* Top Hero section (Breadcrumbs only) - Apply light gray gradient */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 py-8 px-4 border-b border-gray-200">
         <div className="container mx-auto max-w-7xl">
             <Breadcrumbs crumbs={breadcrumbs} />
             {/* Update H1 text color for contrast if needed? Let's keep gray-700 for now */}
             <h1 className="block text-lg md:text-xl font-medium mt-2 text-gray-700">{city.itemCount || 0} {city.itemCount === 1 ? 'Veterinarian' : 'Veterinarians'} in {city.name}{city.state ? `, ${city.state}`: ''}</h1>
         </div>
      </div>
      {/* Second Hero section - Change H1->H2, update text */}
      <div className="bg-white py-10 px-4 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800">The Top {city.itemCount || 0} Pet Clinics in {city.name}</h2>
          {/* Description text */}
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Find the best pet clinics in {city.name} through our curated directory that highlights top-rated veterinarians known for their excellent veterinary care, compassionate service, and up-to-date facilities.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-12 max-w-7xl flex flex-col lg:flex-row gap-8">
        {/* Primary content area should now take full width */}
        <main className="flex-grow">
           <SearchFilterBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedRating={selectedRating}
                onRatingChange={setSelectedRating}
                selectedReviews={selectedReviews}
                onReviewsChange={setSelectedReviews}
                showCategoryFilter={false}
            />
            <p className="mb-6 text-gray-600">
                Showing {paginatedItems.length} of {totalItems} listings found{searchTerm || selectedRating > 0 || selectedReviews > 0 ? ' (filtered)' : ''}.
            </p>

            {isLoading ? (
                <p className="text-center text-gray-500 py-10">Loading listings...</p>
            ) : error ? (
                 <p className="text-center text-red-500 py-10">{error}</p>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedItems.map((item) => (
                  <div key={item.slug} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
                    {/* --- START: Simplify Image Section Styling for Testing --- */}
                    {item.imageUrl && (
                      <Link href={`/${item.citySlug}/${item.slug}`} 
                            // Use fixed height, remove aspect ratio and sizes
                            className="relative block w-full flex-shrink-0 overflow-hidden h-48"> 
                        <Image 
                          src={item.imageUrl}
                          alt={`${item.name}`}
                          fill 
                          style={{ objectFit: 'cover' }} 
                          // Remove sizes prop for this test
                          // sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" 
                        />
                      </Link>
                    )}
                    {/* --- END: Simplify Image Section Styling --- */}
                    
                    {/* Details Section */} 
                    <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
                      {/* Top part: Name, Address, Phone, City Tag */}
                      <div>
                        {/* Update City Tag */}
                        {item.city && (
                            <div className="mb-2 self-start">
                                <span className="inline-block bg-primary-100 text-primary-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                   {item.city}
                                </span>
                            </div>
                        )}
                        {/* Change H2 to H3, keep visual style */}
                        <h3 className="text-xl font-semibold mb-1">
                          <Link href={`/${item.citySlug}/${item.slug}`}>
                            <span className="text-gray-800 hover:text-primary transition-colors duration-150">
                              {item.name}
                            </span>
                          </Link>
                        </h3>
                        {/* Address */}
                        <p className="text-gray-600 text-sm mb-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {item.street || 'Address not specified'}, {item.city}
                        </p>
                        {/* Phone */}
                        {item.phone && (
                          <p className="text-gray-600 text-sm mb-3 flex items-center">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                               <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                             </svg>
                             {item.phone}
                          </p>
                        )}
                      </div>
                      {/* Bottom: Rating/Reviews and View Details */} 
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 pt-3 border-t border-gray-100">
                           {/* Rating/Reviews */}
                           <div className="flex items-center text-sm text-gray-600 mb-2 sm:mb-0 order-2 sm:order-1">
                               {item.rating ? (
                                   <span className="text-yellow-500 mr-1">★ {Number(item.rating).toFixed(1)}</span>
                               ) : (
                                   <span className="text-gray-400 mr-1">★ N/A</span>
                               )}
                               <span className="ml-1">({item.reviews || 0} reviews)</span>
                           </div>
                           {/* View Details Button */}
                           <Link href={`/${item.citySlug}/${item.slug}`} className="order-1 sm:order-2">
                             <span className="inline-block bg-primary-100 text-primary-700 hover:bg-primary-200 text-sm font-medium py-1.5 px-4 rounded-md transition duration-150 ease-in-out self-start sm:self-auto">
                                  View Details
                              </span>
                          </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="mt-8 pt-6 border-t flex justify-center items-center space-x-2">
                       {/* Pagination buttons... */}
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
              </div>
            ) : (
              <p className="text-center text-gray-500 py-10">
                  No listings found matching your criteria in {city.name}.
              </p>
            )}
        </main>
        {/* Sidebar Area */}
        <aside className="w-full lg:w-1/4 lg:max-w-xs flex-shrink-0">
            <FilterSidebar />
        </aside>

      </div> { /* End of flex container */ }

      {/* Remove City-Specific Text Section */}
      {/* 
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <section className="w-full mt-12 pt-8 border-t border-gray-200">
           {city.uniqueText ? (... ) : (...) }
        </section>
      </div>
      */}
    </>
  )
} 