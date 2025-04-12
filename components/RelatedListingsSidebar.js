import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Image

// Remove Haversine Distance Calculation - Moved to API
/*
function calculateDistance(lat1, lon1, lat2, lon2) { ... }
*/

export default function RelatedListingsSidebar({ 
    // Remove relatedItems and allItems props
    currentItemSlug, 
    locationSlug,
    currentLatitude, 
    currentLongitude
}) {
  // State for fetched items, loading, and errors
  const [itemsToDisplay, setItemsToDisplay] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Ensure we have the necessary parameters to fetch
    if (locationSlug && currentItemSlug && currentLatitude != null && currentLongitude != null) {
      setIsLoading(true);
      setError(null);

      const fetchData = async () => {
        try {
          const apiUrl = `/api/related-listings?citySlug=${encodeURIComponent(locationSlug)}&currentItemSlug=${encodeURIComponent(currentItemSlug)}&latitude=${currentLatitude}&longitude=${currentLongitude}`;
          const response = await fetch(apiUrl);
          
          if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          setItemsToDisplay(data || []); // API returns the sorted list
          
        } catch (err) {
          console.error("Error fetching related listings:", err);
          setError("Could not load related listings.");
          setItemsToDisplay([]); // Clear items on error
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
      
    } else {
      // If required props aren't available, don't fetch
      setIsLoading(false);
      setItemsToDisplay([]);
    }
    // Dependency array includes all props needed for the API call
  }, [locationSlug, currentItemSlug, currentLatitude, currentLongitude]);

  // Remove the filtering/sorting logic that was here
  /*
  const sameLocationItems = relatedItems.filter(...).map(...).sort(...);
  let itemsToDisplay = sameLocationItems;
  if (itemsToDisplay.length === 0 && allItems.length > 0) { ... }
  itemsToDisplay = itemsToDisplay.slice(0, 5);
  */

  // Render Loading State
  if (isLoading) {
    return (
      <aside className="w-full md:w-80 lg:w-96 flex-shrink-0">
        <div className="md:sticky md:top-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Loading Listings...</h3>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-16 h-16 flex-shrink-0 rounded bg-gray-200"></div>
                <div className="flex-grow space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  // Render Error State
  if (error) {
     return (
      <aside className="w-full md:w-80 lg:w-96 flex-shrink-0">
        <div className="md:sticky md:top-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-red-600">Error</h3>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </aside>
    );   
  }

  // Render No Results State
  if (itemsToDisplay.length === 0) {
    // Optionally render nothing or a specific message if no related items are found
    // return null; 
     return (
      <aside className="w-full md:w-80 lg:w-96 flex-shrink-0">
        <div className="md:sticky md:top-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">Related Listings</h3>
          <p className="text-sm text-gray-500">No other listings found nearby.</p>
        </div>
      </aside>
    ); 
  }

  // Render the list of items fetched from the API
  return (
    <aside className="w-full md:w-80 lg:w-96 flex-shrink-0">
      <div className="md:sticky md:top-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        {/* Updated Title */}
        <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-700">
          More Pet Clinics Nearby
        </h3>
        <ul className="space-y-4">
          {itemsToDisplay.map((item) => {
            // Distance is now calculated by the API (in miles)
            const distanceDisplay = typeof item.distance === 'number' 
                ? `${item.distance.toFixed(1)} miles away` 
                : null;
            
            return (
                <li key={item.slug} className="flex items-start gap-3">
                    {/* Optional Image Thumbnail */}
                    {item.imageUrl && (
                        <div className="w-16 h-16 relative flex-shrink-0 rounded overflow-hidden border">
                            <Image 
                                src={item.imageUrl}
                                alt={item.name}
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="64px"
                            />
                        </div>
                    )}
                    {!item.imageUrl && (
                         <div className="w-16 h-16 flex-shrink-0 rounded border bg-gray-100 flex items-center justify-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}> <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /> </svg>
                         </div>
                     )}
                    
                    <div className="flex-grow">
                        <Link href={`/${item.citySlug}/${item.slug}`}>
                             <span className="text-blue-600 hover:text-blue-800 hover:underline text-base font-medium block mb-0.5">
                            {item.name}
                             </span>
                        </Link>
                        <p className="text-sm text-gray-500 leading-tight mb-1 flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 mt-0.5 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                           <span>{item.street}, {item.city}</span>
                        </p>
                        
                        {/* Rating and Reviews Count */}
                        {(item.rating || item.reviews) && (
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                                {item.rating && (
                                    <span className="text-yellow-500 mr-1">★ {Number(item.rating).toFixed(1)}</span>
                                )}
                                {item.reviews && (
                                    <span className="ml-1">({item.reviews} reviews)</span>
                                )}
                            </div>
                        )}

                        {/* Distance Display (from API) */}
                        {distanceDisplay && (
                             <p className="text-sm font-semibold text-teal-600 bg-teal-50 inline-block px-1.5 py-0.5 rounded mt-1">
                                {distanceDisplay}
                             </p>
                        )}
                    </div>
                </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
} 