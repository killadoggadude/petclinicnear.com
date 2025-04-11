import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import fs from 'fs';
import path from 'path';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';

// Dynamically import potentially client-side components
const Breadcrumbs = dynamic(() => import('../../components/Breadcrumbs'), { ssr: false });
const GoogleMapComponent = dynamic(() => import('../../components/GoogleMapComponent'), { ssr: false });
const RelatedListingsSidebar = dynamic(() => import('../../components/RelatedListingsSidebar'), { ssr: false });

// --- START: Add Working Hours Parsing Logic ---
// Placeholder: Assuming item.workingHours is a string like:
// "Mon: 9am-5pm | Tue: 9am-5pm | Wed: 9am-1pm | Thu: 9am-5pm | Fri: 9am-5pm | Sat: 10am-2pm | Sun: Closed"
// We need to parse this string into a more usable format.

function parseWorkingHours(hoursString) {
  if (!hoursString || typeof hoursString !== 'string') {
    return null;
  }
  const days = hoursString.split('|').map(dayEntry => dayEntry.trim());
  const schedule = {};
  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  days.forEach(dayEntry => {
    const parts = dayEntry.split(':');
    if (parts.length >= 2) {
      const day = parts[0].trim();
      const time = parts.slice(1).join(':').trim(); // Handle times like "10:30am-..."
      if (dayOrder.includes(day)) {
        schedule[day] = time;
      }
    }
  });
  // Ensure all days are present, even if closed
  dayOrder.forEach(day => {
    if (!schedule[day]) {
      schedule[day] = 'Closed'; // Default if day is missing
    }
  });

  return schedule; // Returns { Mon: "9am-5pm", Tue: "...", ... }
}
// --- END: Add Working Hours Parsing Logic ---

// --- START: Add back getProcessedData function ---
function getProcessedData() {
  const dataPath = path.join(process.cwd(), 'data', 'processed_data.json');
  try {
      const jsonData = fs.readFileSync(dataPath);
      const data = JSON.parse(jsonData);
      // Return the structure expected by getStaticPaths/Props
      return {
          cities: data.cities || [], 
          allItems: data.allItems || [], 
          categories: data.categories || [] // Keep for consistency, even if not used here
      };
  } catch (error) {
      console.error("[getProcessedData] Error reading data:", error);
      return { cities: [], allItems: [], categories: [] }; 
  }
}
// --- END: Add back getProcessedData function ---

export default function ItemPage({ item, relatedItems, allItems, metaDescription }) {
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

  // Parse working hours
  const workingHoursSchedule = parseWorkingHours(item.workingHours);

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
      
      {/* --- Hero Section - Apply light gray gradient --- */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 py-8 px-4 border-b border-gray-200">
          <div className="container mx-auto max-w-7xl">
              {/* Use Dynamic Breadcrumbs */}
              <Breadcrumbs crumbs={breadcrumbs} />
              {/* Keep text color dark for contrast */}
              <span className="block text-3xl md:text-4xl font-bold mt-2 text-gray-800">{item.city}{item.state ? `, ${item.state}`: ''}</span>
          </div>
      </div>

      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 lg:gap-12 max-w-7xl">
          <main className="flex-grow">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
              {/* --- START: Restore Image --- */}
              {item.imageUrl && (
                <div className="w-full h-64 sm:h-80 md:h-96 relative mb-6 rounded-md overflow-hidden"> 
                  <Image 
                    src={item.imageUrl}
                    alt={`${item.name} - Listing in ${item.city}`}
                    fill 
                    style={{ objectFit: 'cover' }} 
                    sizes="100vw" 
                    priority={true} 
                  />
                </div>
              )}
              {/* --- END: Restore Image --- */}
              
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{item.name}</h1>
              
              {/* City/State Link - Update styles */}
              {item.city && (
                  <p className="text-lg text-gray-600 mb-5">
                      Located in: 
                      <Link href={`/${item.citySlug}`}>
                         <span className="hover:underline cursor-pointer font-medium text-primary-600 hover:text-primary-800"> {item.city}</span>
                      </Link>
                      {item.state && <span className="text-gray-500">, {item.state}</span>}
                  </p>
              )}
              
              {/* --- START: Restore Details Grid --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                  {/* Contact Info */}
                  <div>
                      <h2 className="text-xl font-semibold mb-2 text-gray-700">Contact Information</h2>
                      {item.street && item.city && item.state && (
                        <p className="text-lg text-gray-800 mb-1 flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-1 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span>{item.street}<br/>{item.city}, {item.state}</span>
                        </p>
                      )}
                      {item.phone && (
                        <p className="text-lg text-gray-800 mb-3 flex items-center">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                             <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                           </svg>
                           {item.phone}
                        </p>
                      )}
                      {item.website && (
                        <p className="text-lg flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                          </svg>
                          <a href={item.website.startsWith('http') ? item.website : `http://${item.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Visit Website</a>
                        </p>
                     )}
                  </div>
                  {/* Rating/Reviews */}
                  <div>
                     <h2 className="text-xl font-semibold mb-2 text-gray-700">Rating & Reviews</h2>
                     {(item.rating || item.reviews) ? (
                         <div className="flex items-center text-lg mb-4">
                            {item.rating && (
                                <><span className="text-yellow-500 mr-2 text-xl">★</span> <span className="font-semibold mr-1">{item.rating.toFixed(1)}</span></>
                            )}
                            {item.reviews && (
                                <span className="text-gray-600 ml-1">({item.reviews} reviews)</span>
                            )}
                         </div>
                      ) : (
                        <p className="text-gray-600 italic">No rating information available.</p>
                      )}
                  </div>
              </div>
              {/* --- END: Restore Details Grid --- */}
              
              {/* --- START: Restore Description Section --- */}
              {item.description && (
                <div className="mt-6 pt-6 border-t">
                   <h2 className="text-2xl font-semibold mb-3 text-gray-700">About {item.name}</h2>
                   <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                       <ReactMarkdown>{item.description}</ReactMarkdown>
                   </div>
                </div>
              )}
              {/* --- END: Restore Description Section --- */}

              {/* --- START: Add Working Hours Table --- */}
              {workingHoursSchedule && (
                <div className="mt-6 pt-6 border-t">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-700">Working Hours</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">Day</th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600">Hours</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Object.entries(workingHoursSchedule).map(([day, hours]) => (
                          <tr key={day}>
                            <td className="px-4 py-2 font-medium text-gray-800">{day}</td>
                            <td className="px-4 py-2 text-gray-700">{hours}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* --- END: Add Working Hours Table --- */}

            </div>
            {/* Back Link - Update style */}
            <div className="mt-8">
                <Link href={`/${item.citySlug}`}>
                    <span className="text-primary-600 hover:text-primary-800 hover:underline">&larr; Back to {item.city} Listings</span>
                </Link>
            </div>
          </main>
          {/* ... Sidebar ... */}
          <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 space-y-6">
            {/* Use Dynamic Map */}
            <GoogleMapComponent 
              latitude={item.latitude}
              longitude={item.longitude}
              name={item.name}
              address={`${item.street}, ${item.city}, ${item.state}`}
            />
            {/* Use Dynamic Sidebar */}
             <RelatedListingsSidebar 
              relatedItems={relatedItems} 
              currentItemSlug={item.slug}   
              locationSlug={item.citySlug} 
              currentLatitude={item.latitude} 
              currentLongitude={item.longitude}
              allItems={allItems}
            />
          </aside>
      </div>
    </>
  );
}

// Build-time path generation - Add back getStaticPaths
export async function getStaticPaths() {
  // const data = getProcessedData(); // No longer need to read all data here
  // const paths = []; // No longer pre-generating paths
  // data.allItems.forEach(item => {
  //   // Ensure item has citySlug and item slug
  //   if(item.citySlug && item.slug) {
  //       paths.push({
  //           params: {
  //             citySlug: item.citySlug,
  //             itemSlug: item.slug
  //           },
  //       });
  //   } else {
  //       console.warn(`[getStaticPaths /itemSlug] Skipping path generation for item due to missing slugs: ${item.name}`);
  //   }
  // });
  // console.log(`[getStaticPaths /itemSlug] Generated ${paths.length} item paths.`);
  // Return an empty paths array and set fallback to 'blocking'
  return { paths: [], fallback: 'blocking' }
}

// Build-time data fetching - Use city/item slugs
export async function getStaticProps({ params }) {
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

  const currentCity = data.cities.find(c => c.slug === citySlug); 
  const relatedItems = currentCity 
      ? currentCity.items.filter(item => item.slug !== itemSlug)
      : [];

  // Removed category lookup
  const metaDescription = `Find details for ${currentItem.name}, a business located in ${currentItem.city}${currentItem.state ? `, ${currentItem.state}`: ''}. Contact information, services, and more.`;

  return {
    props: {
      item: JSON.parse(JSON.stringify(currentItem)), 
      relatedItems: JSON.parse(JSON.stringify(relatedItems)), 
      allItems: JSON.parse(JSON.stringify(data.allItems)), 
      metaDescription: metaDescription,
    },
  }
} 