import Head from 'next/head'
import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react' // Add useEffect
import Image from 'next/image' // Import Image
import FilterSidebar from '../components/FilterSidebar' // CORRECTED PATH: Import the sidebar
import Breadcrumbs from '../components/Breadcrumbs' // CORRECTED PATH: Import Breadcrumbs
import { useRouter } from 'next/router' // Import useRouter

// Load and prepare data at build time
export async function getStaticProps() {
  const fs = require('fs'); 
  const path = require('path'); 
  
  let cities = []; // Fetch cities
  let allItems = [];

  try {
      const dataPath = path.join(process.cwd(), 'data', 'processed_data.json');
      const jsonData = fs.readFileSync(dataPath);
      const processedData = JSON.parse(jsonData);
      // Use the reverted cities structure
      cities = processedData?.cities || []; 
      allItems = processedData?.allItems || []; 
      console.log(`DEBUG: Read ${allItems.length} items, ${cities.length} cities.`);
  } catch (error) {
      console.error("Error reading or parsing processed data for homepage:", error);
  }
  
  // Sort items by rating (descending), handling nulls
  allItems.sort((a, b) => {
    const ratingA = a.rating ?? -1; // Treat null rating as lowest
    const ratingB = b.rating ?? -1;
    // Secondary sort by reviews if ratings are equal
    if (ratingB !== ratingA) {
        return ratingB - ratingA; 
    }
    const reviewsA = a.reviews ?? 0;
    const reviewsB = b.reviews ?? 0;
    return reviewsB - reviewsA;
  });
  // Take top 8 best rated
  const bestRatedListings = allItems.slice(0, 8); 

  // --- START: Group cities by state --- 
  const statesMap = {};
  cities.forEach(city => {
    const stateName = city.state || 'Unknown State';
    if (!statesMap[stateName]) {
      statesMap[stateName] = { name: stateName, cities: [] };
    }
    statesMap[stateName].cities.push({ 
        name: city.name, 
        slug: city.slug, 
        // Add fallback default for itemCount
        itemCount: typeof city.itemCount === 'number' ? city.itemCount : 0 
    });
  });
  const statesWithCities = Object.values(statesMap).sort((a, b) => a.name.localeCompare(b.name));
  statesWithCities.forEach(state => {
      state.cities.sort((a, b) => a.name.localeCompare(b.name));
  });
  // --- END: Group cities by state ---

  return {
    props: {
      statesWithCities, 
      allItems,
      bestRatedListings, 
      totalItemCount: allItems.length,
    },
  }
}

// --- Helper Component for Listing Card --- 
function ListingCard({ item }) {
    const itemLink = `/${item.citySlug}/${item.slug}`;
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg border border-gray-200 flex flex-col h-full">
            {item.imageUrl && (
                <Link href={itemLink} className="w-full h-40 relative flex-shrink-0 block">
                    <Image 
                        src={item.imageUrl}
                        alt={`${item.name}`}
                        fill 
                        style={{ objectFit: 'cover' }} 
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" 
                    />
                </Link>
            )}
            <div className="p-4 flex flex-col flex-grow">
                {item.city && (
                    <div className="mb-2 self-start">
                        <span className="inline-block bg-primary-100 text-primary-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                           {item.city}
                        </span>
                    </div>
                )}
                <h3 className="font-semibold text-lg mb-1 leading-tight">
                    <Link href={itemLink}>
                       <span className="text-gray-800 hover:text-primary transition-colors duration-150">
                          {item.name}
                       </span>
                    </Link>
                </h3>
                <p className="text-sm text-gray-600 flex items-center mt-1 flex-grow">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-0.5">{item.city}, {item.state}</span>
                </p>
                 <div className="flex items-center text-xs mt-2 text-gray-500 pt-2 border-t border-gray-100">
                     {item.rating ? (
                         <span className="text-yellow-500 mr-1">★ {Number(item.rating).toFixed(1)}</span>
                     ) : (
                         <span className="text-gray-400 mr-1">★ N/A</span>
                     )}
                     <span>({item.reviews || 0} reviews)</span>
                 </div>
            </div>
        </div>
    );
}

// --- FAQ Item Component ---
function FaqItem({ question, answer, isOpen, onToggle }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow border border-gray-200 overflow-hidden">
      <button 
        className="flex justify-between items-center w-full text-left" 
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <h3 className="font-semibold text-lg text-gray-700 mr-2">{question}</h3>
        {/* Arrow Icon */}
        <span className={`transform transition-transform duration-200 ${isOpen ? '-rotate-180' : 'rotate-0'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 mt-3 pt-3 border-t' : 'max-h-0'}`}
        style={{ maxHeight: isOpen ? '24rem' : '0' }} // Explicit max-height for transition
      >
        <p className="text-gray-600 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

// --- Homepage Component --- 
export default function Home({ allItems, bestRatedListings, statesWithCities, totalItemCount }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const baseUrl = "https://petclinicnear.com"; // Updated domain

  // Effect to check URL query parameter on load
  useEffect(() => {
    // Ensure router is ready and query param exists
    if (router.isReady && router.query.q) {
      const queryParam = Array.isArray(router.query.q) ? router.query.q[0] : router.query.q;
      setSearchQuery(queryParam); // Set search state from URL
    }
    // Optional: Clear search if query param is removed?
    // else if (router.isReady && !router.query.q) {
    //   setSearchQuery('');
    // }
  }, [router.isReady, router.query.q]); // Re-run if query param changes

  // Memoize filtered results based on searchQuery state
  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return []; // Return empty array if no search query
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return allItems.filter(item => 
      item.name?.toLowerCase().includes(lowerCaseQuery) ||
      item.city?.toLowerCase().includes(lowerCaseQuery) || 
      item.state?.toLowerCase().includes(lowerCaseQuery) || 
      item.street?.toLowerCase().includes(lowerCaseQuery) ||
      item.description?.toLowerCase().includes(lowerCaseQuery) 
    );
  }, [searchQuery, allItems]); // Re-calculate when searchQuery or allItems change

  // Handle search form submission on the homepage itself (updates state)
  const handleHomepageSearch = (event) => {
    event.preventDefault(); 
    // Just update the state, useMemo will trigger filtering
    // We could also push the query to the URL, but updating state is simpler here
    // router.push(`/?q=${encodeURIComponent(searchQuery)}`); 
    // For simplicity, we'll let the existing filter logic run based on state change
    // If user manually clears input, filteredSearchResults becomes empty
  };

  // Placeholder FAQ data (Expanded to 10 items)
  const faqs = [
    { question: "How up-to-date is the clinic information?", answer: "We strive to keep our directory information as current as possible by regularly reviewing listings and incorporating updates. However, clinic hours, services, and staffing can change quickly. We always recommend calling the clinic directly to confirm details before your visit." },
    { question: "Are the ratings and reviews reliable?", answer: "Ratings and reviews are aggregated from various public sources and user submissions. While helpful, they represent individual opinions and experiences. We encourage you to consider multiple reviews and consult with the clinic directly to form your own impression." },
    { question: "How do I find a clinic that specializes in exotic pets?", answer: "Currently, our search focuses on general pet care. While some clinics listed may treat exotic pets, we recommend contacting clinics directly to inquire about their experience and services for specific types of animals like reptiles, birds, or small mammals." },
    { question: "What should I do in a pet emergency?", answer: "If your pet is experiencing a medical emergency, please contact the nearest listed emergency pet clinic or animal hospital immediately. This directory can help you find contact information quickly, but always call ahead to confirm their emergency service availability and procedures." },
    { question: "How can I find clinics with specific services like grooming or boarding?", answer: "Our directory primarily focuses on veterinary medical services. While some clinic profiles might mention additional services like grooming or boarding, using the main search bar with terms like 'grooming' or 'boarding' along with your location might help narrow results. Calling clinics is the best way to confirm specific non-medical services." },
    { question: "Is this directory free to use?", answer: "Yes! Our directory is completely free for pet owners searching for clinics. Our goal is simply to make finding great pet care easier for everyone." },
    { question: "How can I get my pet clinic listed?", answer: "We're always looking to expand our listings! Please visit our Contact page and send us your clinic's details. We'll review the information for inclusion in the directory." },
    { question: "What's the difference between a vet clinic and an animal hospital?", answer: "Often, the terms are used interchangeably. Generally, animal hospitals might offer more extensive services, including 24/7 emergency care and specialized surgical facilities, while clinics might focus more on routine wellness, preventive care, and less complex procedures during regular hours. It's best to check the specific services offered by each listing." },
    { question: "How do I choose the right veterinarian for my pet?", answer: "Consider factors like location, office hours, services offered, the clinic's approach to care (e.g., fear-free practices), and recommendations or reviews. It's often helpful to schedule a brief initial visit or call to get a feel for the clinic and staff." },
    { question: "Does this directory include mobile veterinarians?", answer: "Our current focus is on physical clinic locations. While some listed clinics might offer house calls, we don't specifically filter for mobile-only vets at this time. We recommend searching online specifically for 'mobile veterinarians' in your area if needed." },
  ];

  const handleFaqToggle = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index); // Toggle: open clicked, close others
  };

  const showSearchResults = searchQuery.trim().length > 0;

  // Define breadcrumbs for search results page
  const searchBreadcrumbs = [
    { name: 'Home', href: '/' },
    { name: `Search Results for "${searchQuery}"`, href: null },
  ];

  // Define breadcrumbs for homepage (only used when not searching)
  const homeBreadcrumbs = [{ name: 'Home', href: null }]; // Example if needed

  // Homepage Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": baseUrl,
    "name": "Pet Clinic Directory",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <Head>
        {/* Dynamically set title based on search */} 
        <title>{showSearchResults ? `Search: ${searchQuery}` : 'Find Local Listings Near You'} - DirectoryTemplate</title>
        <meta name="description" content={showSearchResults ? `Search results for ${searchQuery}` : "Search our nationwide directory..."} />
        <meta name="keywords" content="directory, listings, local, search" />
        <link rel="canonical" href={baseUrl} />
        {/* OG Tags for Homepage */}
        {/* <meta property="og:title" content="Pet Clinic Directory" /> */}
        {/* <meta property="og:description" content="Find local pet clinics near you" /> */}
        <meta property="og:url" content={baseUrl} />
        {/* Update placeholder image URL comment */}
        {/* <meta property="og:image" content={`${baseUrl}/images/og-homepage.png`} /> */}
        {/* Twitter Card Tags */}
        {/* <meta name="twitter:title" content="Pet Clinic Directory" /> */}
        {/* <meta name="twitter:description" content="Find local pet clinics near you" /> */}
        {/* <meta name="twitter:image" content={`${baseUrl}/images/og-homepage.png`} /> */}
        
        {/* JSON-LD Schema */}
        {/* <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script> */}
      </Head>

      {/* CONDITIONAL RENDERING: Show Search Results Layout OR Default Homepage Layout */} 
      {showSearchResults ? (
        // --- SEARCH RESULTS LAYOUT --- 
        <>
          {/* Simple Hero for Search Results */}
          <div className="bg-gradient-to-r from-primary-50 to-orange-100 py-8 px-4 border-b border-orange-200">
            <div className="container mx-auto max-w-7xl">
                <Breadcrumbs crumbs={searchBreadcrumbs} />
                {/* Main H1 for Search Results */}
                <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-800">Search results for "{searchQuery}"</h1>
            </div>
          </div>

          {/* Search Results Content Area */}
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            <h2 className="sr-only">Search Results List ({filteredSearchResults.length})</h2> {/* Screen reader heading */}
            {filteredSearchResults.length > 0 ? (
              <div className="space-y-4">
                 {filteredSearchResults.map((item) => (
                    // Add flex container for image + text
                    <div key={`${item.citySlug}-${item.slug}`} className="bg-white p-4 rounded-md shadow-sm border border-gray-200 flex gap-4 items-start">
                         {/* START: Image Thumbnail */}
                         {item.imageUrl && (
                            <Link href={`/${item.citySlug}/${item.slug}`} className="flex-shrink-0 w-24 h-24 relative block rounded overflow-hidden border">
                                <Image 
                                    src={item.imageUrl}
                                    alt={item.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    sizes="96px"
                                />
                            </Link>
                         )}
                         {!item.imageUrl && (
                             <div className="flex-shrink-0 w-24 h-24 rounded border bg-gray-100 flex items-center justify-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}> <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /> </svg>
                             </div>
                         )}
                         {/* END: Image Thumbnail */}

                         {/* Text Content (Takes remaining space) */}
                         <div className="flex-grow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                             <div className="flex-grow">
                                <h3 className="text-lg font-semibold text-primary-700 hover:text-primary-900">
                                    <Link href={`/${item.citySlug}/${item.slug}`}>{item.name}</Link>
                                </h3>
                                <p className="text-gray-600 text-sm mt-1">{item.street}</p>
                                <p className="text-gray-600 text-sm">{item.city}, {item.state}</p>
                                {(item.rating || item.reviews) && (
                                    <div className="flex items-center text-xs mt-1 text-gray-500">
                                        {item.rating && <span className="text-yellow-500 mr-1">★ {item.rating.toFixed(1)}</span>}
                                        {item.reviews && <span>({item.reviews} reviews)</span>}
                                    </div>
                                )}
                            </div>
                            <Link href={`/${item.citySlug}/${item.slug}`} className="mt-2 sm:mt-0 flex-shrink-0">
                               <span className="inline-block bg-primary-100 text-primary-700 hover:bg-primary-200 text-sm font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out">
                                    View Details &rarr;
                                </span>
                            </Link>
                        </div>
                    </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-10 bg-gray-100 rounded-md">No items found matching your search criteria: "{searchQuery}"</p>
            )}
          </div>
        </>
        // --- END SEARCH RESULTS LAYOUT --- 

      ) : (

        // --- DEFAULT HOMEPAGE LAYOUT --- 
        <>
          {/* Hero Section - Update Styling */}
          <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 text-gray-800 py-16 px-4 text-center border-b border-gray-200"> {/* Light Gray Gradient */}
              <div className="container mx-auto max-w-7xl">
                  {/* Update text color */}
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Find Your Local Pet Clinic</h1>
                  {/* Update text color */}
                  <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-600">Compassionate, reliable pet clinics are just a search away. Enter your location or browse our veterinary directory.</p>
                  {/* Search Form */}
                  <form onSubmit={handleHomepageSearch} className="mb-4 max-w-xl mx-auto flex gap-2">
                      <input
                          type="text"
                          placeholder="Search by name, city, state, address..." 
                          className="flex-grow p-4 border rounded-l-md shadow-sm text-gray-800 focus:ring-2 focus:ring-primary-300 focus:outline-none"
                          value={searchQuery} 
                          onChange={(e) => setSearchQuery(e.target.value)} 
                      />
                      <button 
                          type="submit"
                          // Change button color
                          className="bg-primary hover:bg-primary-600 text-white font-bold py-2 px-6 rounded-r-md shadow-sm transition duration-150 ease-in-out"
                      >
                          Search
                      </button>
                  </form>
              </div>
          </div>

          {/* Default Homepage Main Content Area */}
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="space-y-12">
                {/* Best Rated Listings Section */}
                {bestRatedListings.length > 0 && (
                    <section>
                        <h2 className="text-3xl font-semibold mb-6 border-b-2 border-gray-300 pb-2">Best Rated Pet Clinics</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {bestRatedListings.map(item => <ListingCard key={`${item.citySlug}-${item.slug}`} item={item} />)}
                        </div>
                    </section>
                )}

                {/* Browse by Location Section - Group by State in 3 columns */}
                {statesWithCities && statesWithCities.length > 0 && (
                    <section className="mb-16">
                        {/* Section Heading */}
                        <h2 className="text-3xl font-bold text-center mb-8">Browse Pet Clinics by City</h2>
                        {/* Grid for States (3 columns on large screens) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> 
                            {statesWithCities.map(state => (
                                // State Box
                                <div key={state.name} className="p-6 bg-white rounded-lg shadow border border-gray-200 flex flex-col"> {/* Use flex flex-col */} 
                                    {/* State Name Heading (H3, Not linked) */}
                                    <h3 className="font-semibold text-xl mb-4 text-gray-800 border-b pb-2">
                                       Pet Clinics in {state.name}
                                    </h3>
                                    {/* Grid for Cities (2 columns) */}
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 flex-grow"> {/* Add flex-grow */} 
                                        {Array.isArray(state.cities) && state.cities.map(city => (
                                            <Link key={city.slug} href={`/${city.slug}`}>
                                                {/* City Name (H4 or P) */}
                                                <span className="block text-primary-600 hover:text-primary-800 hover:underline text-sm truncate py-0.5">
                                                    {city.name} ({city.itemCount})
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* FAQ Section - Render the faqs array (grid handles layout) */}
                <section className="mt-16 pt-12 border-t border-gray-200">
                    <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">Frequently Asked Questions</h2>
                     <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                        {faqs.map((faq, index) => (
                             <FaqItem 
                               key={index} 
                               question={faq.question} 
                               answer={faq.answer} 
                               isOpen={openFaqIndex === index}
                               onToggle={() => handleFaqToggle(index)}
                             />
                        ))}
                     </div>
                </section>
            </div>
          </div>
        </>
        // --- END DEFAULT HOMEPAGE LAYOUT --- 
      )}
    </>
  )
} 