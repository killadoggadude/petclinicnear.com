import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';

// Dynamically import potentially client-side components
const Breadcrumbs = dynamic(() => import('../../components/Breadcrumbs'), { ssr: false });
const GoogleMapComponent = dynamic(() => import('../../components/GoogleMapComponent'), { ssr: false });
// Import the two new sidebar components
const NearbyListingsSidebar = dynamic(() => import('../../components/NearbyListingsSidebar'), { ssr: false });
const BestRatedSidebar = dynamic(() => import('../../components/BestRatedSidebar'), { ssr: false });

// Define the desired display order for days
const dayDisplayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ItemPage({ item, metaDescription }) {
  const router = useRouter();
  const baseUrl = "https://petclinicnear.com"; // Updated domain
  const pageUrl = `${baseUrl}${router.asPath}`;

  if (router.isFallback) {
    return <div>Loading...</div>;
  }
  // This check ensures item exists before proceeding
  if (!item) {
      console.error("ItemPage rendered without valid 'item' prop."); // Added log
      return <div>Item data not found.</div>;
  }

  // Working hours schedule is now directly available as item.workingHours (if it exists and is an object)
  const workingHoursSchedule = (item.workingHours && typeof item.workingHours === 'object' && !Array.isArray(item.workingHours)) 
      ? item.workingHours 
      : null;

  // Define breadcrumbs *after* the item check
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Cities', href: '/cities' }, 
    { name: item.city, href: `/${item.citySlug}` }, 
    { name: item.name, href: null },
  ];

  // --- START Schema Generation --- 
  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.href ? `${baseUrl}${crumb.href}` : undefined 
    }))
  };

  // VeterinaryCare Schema
  const clinicSchema = {
    "@context": "https://schema.org",
    "@type": "VeterinaryCare",
    "name": item.name,
    "description": item.description ? item.description.substring(0, 250) : metaDescription, // Use meta as fallback
    "image": item.imageUrl || undefined,
    "url": pageUrl,
    "telephone": item.phone || undefined,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": item.street || undefined,
      "addressLocality": item.city || undefined,
      "addressRegion": item.state || undefined,
      // "postalCode": item.zip || undefined, // Add if you have zip code
      // "addressCountry": "US" // Assuming US
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": item.latitude || undefined,
      "longitude": item.longitude || undefined
    },
    // Add aggregateRating if you have rating/review count
    ...(item.rating && item.reviews && {
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": item.rating,
            "reviewCount": item.reviews
        }
    })
  };
  // --- END Schema Generation --- 

  // --- Process Description --- 
  let businessDescriptionHtml = null;
  if (item?.description) {
      const description = item.description.trim();
      // Check if description starts with <h2 (case-insensitive)
      if (description.toLowerCase().startsWith('<h2')) {
          businessDescriptionHtml = description; // Use as is
      } else {
          // Prepend default H2
          businessDescriptionHtml = `<h2>About ${item.name} in ${item.city}</h2>\n${description}`;
      }
  }
  // --- End Process Description ---

  return (
    <>
      <Head>
        <title>{`${item.name} - ${item.city}${item.state ? `, ${item.state}`: ''} | Pet Clinic Directory`}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={pageUrl} />
        {/* OG Tags */}
        <meta property="og:title" content={`${item.name} - ${item.city} Pet Clinic`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={pageUrl} />
        {item.imageUrl && <meta property="og:image" content={item.imageUrl} />}
        <meta property="og:type" content="place" /> 
        {/* Add place:location if possible */}
        {item.latitude && <meta property="place:location:latitude" content={item.latitude.toString()} />}
        {item.longitude && <meta property="place:location:longitude" content={item.longitude.toString()} />}
        {/* Twitter Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${item.name} - ${item.city} Pet Clinic`} />
        <meta name="twitter:description" content={metaDescription} />
        {item.imageUrl && <meta name="twitter:image" content={item.imageUrl} />}
        
        {/* JSON-LD Schema */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicSchema) }}
        />
      </Head>
      
      {/* --- Top Hero Section (Breadcrumbs only) --- */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 py-8 px-4 border-b border-gray-200">
          <div className="container mx-auto max-w-7xl">
              {/* Use Dynamic Breadcrumbs */}
              <Breadcrumbs crumbs={breadcrumbs} />
          </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 lg:gap-12 max-w-7xl">
          <main className="flex-grow">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200">

              {/* --- START: Image Hero Section --- */}
              {item.imageUrl && (
                <div className="relative w-full h-80 rounded-lg overflow-hidden mb-8 shadow-inner"> {/* Added shadow-inner */} 
                  {/* Background Image */}
                  <Image 
                    src={item.imageUrl}
                    alt={`Background for ${item.name}`}
                    fill 
                    style={{ objectFit: 'cover' }} 
                    priority={true} 
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent"></div> 
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white">
                    {/* Moved H1 here */}
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 drop-shadow-md">{item.name}</h1>
                    
                    {/* Moved Contact Details Here (no H3) */}
                    <div className="text-sm text-gray-200 space-y-1">
                      {/* Address */}
                      <p className="flex items-start">
                        {item.street && item.city && item.state && (
                           <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" opacity="0.8">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              <span>{item.street}, {item.city}, {item.state}</span>
                           </>
                        )}
                      </p>
                      {/* Phone - Always render <p>, conditionally render content */}
                      <p className="flex items-center">
                        {item.phone && (
                          <>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" opacity="0.8">
                               <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                             </svg>
                             {item.phone}
                          </>
                        )}
                      </p>
                      {/* Website Button - Always render <p>, conditionally render <a> */}
                      <p className="mt-4">
                        {item.website && (
                            <a 
                              href={item.website.startsWith('http') ? item.website : `http://${item.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-primary hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition duration-150 ease-in-out shadow"
                            >
                              Visit Website
                            </a>
                         )}
                       </p>
                    </div>
                  </div>
                </div>
              )}
              {/* --- END: Image Hero Section --- */}

              {/* --- START: Main Info Section Below Hero --- */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  {item.name}{item.city ? ` in ${item.city}${item.state ? `, ${item.state}` : ''}` : ''}
                </h2>
                <div className="space-y-2 text-lg text-gray-700"> 
                   {/* Address */}
                   <p className="flex items-center">
                      {item.street && item.city && item.state && (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span>{item.street}, {item.city}, {item.state}</span>
                        </>
                      )}
                    </p>
                    {/* Phone - REMOVE conditional check, always render structure */}
                    <p className="flex items-center"> 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        {item.phone} {/* Render directly */} 
                    </p>
                    {/* Website - REMOVE conditional check, always render structure */}
                    <p className="flex items-center"> 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        <a href={item.website?.startsWith('http') ? item.website : `http://${item.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800 hover:underline break-all">
                          {(() => { /* ... domain calculation ... */ 
                              // Add check for item.website existence inside IIFE for safety
                              if (!item.website) return null; 
                              try {
                                const url = new URL(item.website.startsWith('http') ? item.website : `http://${item.website}`);
                                let hostname = url.hostname;
                                if (hostname.startsWith('www.')) {
                                  hostname = hostname.substring(4);
                                }
                                return hostname;
                              } catch (e) {
                                return item.website;
                              }
                           })()} 
                        </a> 
                    </p>
                </div>
              </div>
              {/* --- END: Main Info Section Below Hero --- */}

              {/* City/State Link is now redundant here, remove or comment out */}
              {/* {item.city && (...)} */}
              
              {/* Container for Rating & Top Rated Badge */}
              <div className="flex flex-col md:flex-row gap-8 items-start mt-6 pt-6 border-t border-gray-200"> 
                  {/* Rating/Reviews Block (Left) */}
                  <div className="flex-1"> {/* Use flex-1 to allow growth */} 
                     <h3 className="text-xl font-semibold mb-2 text-gray-700">Rating & Reviews</h3>
                     {(item.rating || item.reviews) ? (
                         <div className="flex items-center text-xl mb-4">
                            {item.rating && (
                                <><span className="text-yellow-500 mr-2 text-2xl">★</span> <span className="font-semibold mr-1">{Number(item.rating).toFixed(1)}</span></>
                            )}
                            {item.reviews && (
                                <span className="text-gray-600 ml-1">({item.reviews} reviews)</span>
                            )}
                         </div>
                      ) : (
                        <p className="text-gray-600 italic">No rating information available.</p>
                      )}
                  </div>

                   {/* Top Rated Block (Right) */}
                   <div className="flex-shrink-0"> {/* Prevent shrinking */} 
                       <h3 className="text-xl font-semibold mb-2 text-gray-700">Top rated by customers</h3>
                       <div className="relative w-32 h-32"> {/* Sized container for image */} 
                           <Image 
                               src="/images/best-rated-pet-clinic.png"
                               alt="Top Rated Pet Clinic Badge"
                               fill
                               style={{ objectFit: 'contain' }} // Use contain or cover as needed
                           />
                       </div>
                   </div>
              </div>       
              
              {/* --- START: Working Hours Section --- */}
              {workingHoursSchedule && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Working Hours</h3>
                   {/* Added Styling */}
                  <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dayDisplayOrder.map((day, index) => (
                          <tr key={day} className={`${index % 2 === 0 ? 'bg-white' : 'bg-primary-50/50'}`}> {/* Alternating row colors */} 
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{day}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{workingHoursSchedule[day] ?? 'Not specified'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* --- END: Working Hours Section --- */}
              
              {/* --- START: Business Description Section --- */}
              {businessDescriptionHtml && (
                <div className="mt-8 pt-8 border-t border-gray-200"> 
                   {/* Use prose for basic styling */}
                   <div 
                     className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
                     dangerouslySetInnerHTML={{ __html: businessDescriptionHtml }}
                   />
                </div>
              )}
              {/* --- END: Business Description Section --- */}

            </div>
            {/* Back Link - Update style */}
            <div className="mt-8">
                <Link href={`/${item.citySlug}`}>
                    <span className="text-primary-600 hover:text-primary-800 hover:underline">&larr; Back to {item.city} Listings</span>
                </Link>
            </div>
          </main>
          {/* ... Sidebar ... */}
          <aside className="w-full lg:w-1/3 flex-shrink-0 space-y-6">
            {/* Google Map */}
            <div className="w-full h-auto aspect-square md:h-80 lg:h-96"> 
              <GoogleMapComponent 
                latitude={item.latitude}
                longitude={item.longitude}
                name={item.name}
                address={`${item.street}, ${item.city}, ${item.state}`}
              />
            </div>
            
            {/* Nearby Listings Sidebar */}
             <NearbyListingsSidebar 
              currentItemSlug={item.slug}   
              locationSlug={item.citySlug} 
              currentLatitude={item.latitude} 
              currentLongitude={item.longitude}
            />
            
            {/* Best Rated Sidebar */}
            <BestRatedSidebar 
               currentItemSlug={item.slug} 
            />
          </aside>
      </div>
    </>
  );
}

// Build-time path generation - Use fallback: 'blocking'
export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

// Build-time data fetching - Use city/item slugs
export async function getStaticProps({ params }) {
  // Add back the require statement for getProcessedData
  const { getProcessedData } = require('../../lib/data');
  
  // Log received params
  console.log(`[getStaticProps /itemSlug] Received params:`, params);

  const data = getProcessedData();
  const { citySlug, itemSlug } = params;

  // Log the slugs we are looking for
  console.log(`[getStaticProps /itemSlug] Looking for citySlug: "${citySlug}", itemSlug: "${itemSlug}"`);

  // Find the specific item using city/item slugs
  const currentItem = data.allItems.find(
    (i) => i.citySlug === citySlug && i.slug === itemSlug
  );

  if (!currentItem) {
    console.error(`[getStaticProps /itemSlug] Item NOT FOUND for citySlug: "${citySlug}", itemSlug: "${itemSlug}"`);
    // Log a snippet of allItems slugs for comparison
    console.log(`[getStaticProps /itemSlug] Available slugs sample:`,
      data.allItems.slice(0, 5).map(i => ({ city: i.citySlug, item: i.slug }))
    );
    return { notFound: true }
  }

  console.log(`[getStaticProps /itemSlug] Found item: ${currentItem.name}`);

  const metaDescription = `Find details for ${currentItem.name}, a pet clinic located in ${currentItem.city}${currentItem.state ? `, ${currentItem.state}`: ''}. Contact information, address, rating, and working hours.`;

  return {
    props: {
      item: JSON.parse(JSON.stringify(currentItem)),
      metaDescription: metaDescription,
    },
  }
} 