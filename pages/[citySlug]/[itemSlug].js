import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';

// Dynamically import potentially client-side components
const Breadcrumbs = dynamic(() => import('../../components/Breadcrumbs'), { ssr: false });
const GoogleMapComponent = dynamic(() => import('../../components/GoogleMapComponent'), { ssr: false });
const RelatedListingsSidebar = dynamic(() => import('../../components/RelatedListingsSidebar'), { ssr: false });

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

              {/* --- START: Updated Working Hours Table --- */}
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
                        {dayDisplayOrder.map((day) => (
                          <tr key={day}>
                            <td className="px-4 py-2 font-medium text-gray-800">{day}</td>
                            <td className="px-4 py-2 text-gray-700">{workingHoursSchedule[day] ?? 'Not specified'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* --- END: Updated Working Hours Table --- */}

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
            {/* Wrap map in a div with explicit height matching width */}
            <div className="w-full h-auto aspect-square md:h-80 lg:h-96"> {/* Use aspect-square for responsiveness */} 
              <GoogleMapComponent 
                latitude={item.latitude}
                longitude={item.longitude}
                name={item.name}
                address={`${item.street}, ${item.city}, ${item.state}`}
              />
            </div>
            {/* Use Dynamic Sidebar */}
             <RelatedListingsSidebar 
              currentItemSlug={item.slug}   
              locationSlug={item.citySlug} 
              currentLatitude={item.latitude} 
              currentLongitude={item.longitude}
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