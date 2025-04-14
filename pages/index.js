import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react' // Keep useState/useEffect for search input 
import Image from 'next/image' // Import Image
import ListingCard from '../components/ListingCard'; // Import the extracted component
import FilterSidebar from '../components/FilterSidebar' // CORRECTED PATH: Import the sidebar
import Breadcrumbs from '../components/Breadcrumbs' // CORRECTED PATH: Import Breadcrumbs
import { useRouter } from 'next/router' // Import useRouter
const { getProcessedData } = require('../lib/data'); // Import helper

// Load and prepare data at build time
export async function getStaticProps() {
  const fs = require('fs'); 
  const path = require('path'); 
  
  let cities = [];
  let allItems = []; // Still load allItems to find best rated
  let processedData = {}; // Initialize processedData

  try {
      processedData = getProcessedData(); // Use helper
      cities = processedData?.cities || []; 
      allItems = processedData?.allItems || []; 
      console.log(`DEBUG (Homepage getStaticProps): Read ${allItems.length} items, ${cities.length} cities.`);
  } catch (error) {
      console.error("Error reading or parsing processed data for homepage:", error);
      // Return empty/default props on error, including for states
      return { props: { bestRatedListings: [], topCityColumns: [], topStateColumns: [], totalItemCount: 0 } };
  }
  
  // Sort items by rating
  allItems.sort((a, b) => {
    const ratingA = a.rating ?? -1; 
    const ratingB = b.rating ?? -1;
    if (ratingB !== ratingA) {
        return ratingB - ratingA; 
    }
    const reviewsA = a.reviews ?? 0;
    const reviewsB = b.reviews ?? 0;
    return reviewsB - reviewsA;
  });
  // Take top 12 best rated
  const bestRatedListings = allItems.slice(0, 12); 

  // --- Select and Group Top Cities --- 
  const MIN_LISTINGS_THRESHOLD = 2; 
  const NUM_TOP_CITIES_TO_SHOW = 60;
  const NUM_COLUMNS = 4;

  const topCities = cities
    .filter(city => city.itemCount >= MIN_LISTINGS_THRESHOLD) 
    .sort((a, b) => b.itemCount - a.itemCount) 
    .slice(0, NUM_TOP_CITIES_TO_SHOW); 

  const topCityColumns = Array.from({ length: NUM_COLUMNS }, () => []);
  topCities.forEach((city, index) => {
    topCityColumns[index % NUM_COLUMNS].push({
        name: city.name,
        slug: city.slug,
        itemCount: city.itemCount,
        state: city.state || null 
    });
  });
  // --- END: Select and Group Top Cities ---

  // --- START: Select and Group Top States ---
  const stateCounts = {};
  allItems.forEach(item => {
    const stateName = item.state || 'Unknown State';
    if (stateName !== 'Unknown State') { 
      stateCounts[stateName] = (stateCounts[stateName] || 0) + 1;
    }
  });

  const allStates = Object.entries(stateCounts).map(([name, count]) => ({
    name: name,
    slug: name.toLowerCase().replace(/\s+/g, '-'), 
    itemCount: count,
  })).sort((a, b) => a.name.localeCompare(b.name)); // Sort states alphabetically

  const NUM_STATE_COLUMNS = 4; // Can be same or different from city columns
  const topStateColumns = Array.from({ length: NUM_STATE_COLUMNS }, () => []);
  allStates.forEach((state, index) => { // Use all states for now, can slice later if needed
    topStateColumns[index % NUM_STATE_COLUMNS].push({
        name: state.name,
        slug: state.slug, 
        itemCount: state.itemCount,
    });
  });
  // --- END: Select and Group Top States ---

  return {
    props: {
      topCityColumns, 
      topStateColumns, // Add states to props
      bestRatedListings, 
      // Pass totalItemCount if needed for display, otherwise remove
      // totalItemCount: allItems.length, 
    },
  }
}

// --- Helper Component for Listing Card --- 
// // Function definition removed, now imported from ../components/ListingCard.js
// function ListingCard({ item }) { ... }

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
export default function Home({ bestRatedListings, topCityColumns, topStateColumns }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqStates, setOpenFaqStates] = useState({});
  const baseUrl = "https://petclinicnear.com"; // Updated domain

  // Standard search form handler - Navigates to /search?q=...
  const handleHomepageSearch = (event) => {
    event.preventDefault(); 
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
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

  // Updated toggle handler for independent states
  const handleFaqToggle = (index) => {
    setOpenFaqStates(prevStates => ({
      ...prevStates,
      [index]: !prevStates[index] // Toggle the boolean state for the clicked index
    }));
  };

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
        {/* Static Title for Homepage */}
        <title>Best Pet Clinics Near Me - Veterinary Directory</title>
        {/* Static Description for Homepage */}
        <meta name="description" content="Search our nationwide directory for the best local pet clinics and veterinary services near you." />
        <meta name="keywords" content="pet clinic, veterinary, vet, veterinarian, near me, directory, animal hospital" />
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

      {/* --- DEFAULT HOMEPAGE LAYOUT --- */}
      <>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 text-gray-800 py-16 px-4 text-center border-b border-gray-200">
            <div className="container mx-auto max-w-7xl">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Find Your Local Pet Clinic</h1>
                <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-600">Compassionate, reliable pet clinics are just a search away. Enter your location or browse our veterinary directory.</p>
                {/* Search Form - Uses standard handler now */}
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
              {bestRatedListings && bestRatedListings.length > 0 && (
                  <section>
                      <h2 className="text-3xl font-semibold mb-6 border-b-2 border-gray-300 pb-2">Best Rated Pet Clinics</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {bestRatedListings.map(item => <ListingCard key={`${item.citySlug}-${item.slug}`} item={item} />)}
                      </div>
                  </section>
              )}

              {/* Browse Popular Cities Section - Use 4 columns */}
              {topCityColumns && topCityColumns.length > 0 && (
                  <section className="mb-16">
                      {/* Section Heading */}
                      <h2 className="text-3xl font-bold text-center mb-8">Browse Popular Cities</h2>
                      {/* Grid for Columns (4 columns on large screens) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"> 
                          {topCityColumns.map((column, colIndex) => {
                            return (
                              // Column Box
                              <div key={colIndex} className="p-5 bg-white rounded-lg shadow border border-gray-100"> 
                                  {/* Simple list of cities within the column */}
                                  <ul className="space-y-1.5">
                                      {Array.isArray(column) && column.map(city => (
                                          <li key={city.slug}>
                                              <Link href={`/${city.slug}`}>
                                                  <span className="block text-primary-600 hover:text-primary-800 hover:underline text-sm truncate">
                                                      {city.name} <span className="text-xs text-gray-400">({city.itemCount})</span>
                                                  </span>
                                              </Link>
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                            );
                          })}
                      </div>
                      {/* Link to see all cities */}
                      <div className="text-center mt-8">
                          <Link href="/cities">
                              <span className="text-primary-600 hover:text-primary-800 hover:underline font-medium">
                                  View All Cities &rarr;
                              </span>
                          </Link>
                      </div>
                  </section>
              )}

              {/* Browse Pet Clinics by State Section - New Section */}
              {topStateColumns && topStateColumns.length > 0 && (
                  <section className="mb-16">
                      <h2 className="text-3xl font-bold text-center mb-8">Browse Pet Clinics by State</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {topStateColumns.map((column, colIndex) => (
                              <div key={colIndex} className="p-5 bg-white rounded-lg shadow border border-gray-100">
                                  <ul className="space-y-1.5">
                                      {Array.isArray(column) && column.map(state => (
                                          <li key={state.slug}>
                                              {/* Placeholder Link - Will point to /states for now, could link to specific state page later */}
                                              <Link href={`/states`}> 
                                                  <span className="block text-primary-600 hover:text-primary-800 hover:underline text-sm truncate">
                                                      {state.name} <span className="text-xs text-gray-400">({state.itemCount})</span>
                                                  </span>
                                              </Link>
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                          ))}
                      </div>
                      {/* Link to see all states */}
                      <div className="text-center mt-8">
                          <Link href="/states">
                              <span className="text-primary-600 hover:text-primary-800 hover:underline font-medium">
                                  View All States &rarr;
                              </span>
                          </Link>
                      </div>
                  </section>
              )}

              {/* FAQ Section - Updated to use independent state */}
              <section className="mt-16 pt-12 border-t border-gray-200">
                  <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">Frequently Asked Questions</h2>
                   <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6"> 
                      {faqs.map((faq, index) => (
                           <FaqItem 
                             key={index} 
                             question={faq.question} 
                             answer={faq.answer} 
                             // Check the state for this specific index
                             isOpen={!!openFaqStates[index]} 
                             onToggle={() => handleFaqToggle(index)}
                           />
                      ))}
                   </div>
              </section>
          </div>
        </div>
      </>
      {/* --- END DEFAULT HOMEPAGE LAYOUT --- */}
    </>
  )
} 