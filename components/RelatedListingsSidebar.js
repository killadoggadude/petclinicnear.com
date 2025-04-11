import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Image

// --- Haversine Distance Calculation --- 
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return null; // Cannot calculate if coordinates are missing
  }

  function toRad(Value) {
    return Value * Math.PI / 180;
  }

  const R = 6371; // km
  //const R = 3958.8; // miles - Use this line instead if you want miles

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  lat1 = toRad(lat1);
  lat2 = toRad(lat2);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  const d = R * c;
  return d; // Distance in km (or miles if R is changed)
}
// ------------------------------------

export default function RelatedListingsSidebar({ 
    relatedItems = [], 
    currentItemSlug, 
    locationSlug,
    currentLatitude, // Add props for current coordinates
    currentLongitude,
    allItems = [] // New prop to access all listings when needed
}) {
  // Log coordinates received by the sidebar
  console.log('Sidebar received current Coords:', { currentLatitude, currentLongitude });
  
  const sameLocationItems = relatedItems
    .filter(i => i.slug !== currentItemSlug)
    .map(i => {
        // Log coordinates for each related item being processed
        console.log(`  Calculating distance for ${i.name}: Current(${currentLatitude}, ${currentLongitude}) vs Item(${i.latitude}, ${i.longitude})`);
        const distance = calculateDistance(currentLatitude, currentLongitude, i.latitude, i.longitude);
        // Log the calculated distance
        console.log(`    -> Calculated Distance: ${distance}`);
        return {
            ...i,
            distance: distance // Use the calculated distance variable
        }
    })
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)); // Sort by distance, closest first
  
  // If no items in the same location, grab random items from all items
  let itemsToDisplay = sameLocationItems;
  
  if (itemsToDisplay.length === 0 && allItems.length > 0) {
    // If no same-location items but we have all items, select random ones
    const randomItems = allItems
      .filter(i => i.slug !== currentItemSlug) // Exclude current item
      .map(i => {
        // Log coordinates for each random item being processed
        console.log(`  Calculating distance for RANDOM ${i.name}: Current(${currentLatitude}, ${currentLongitude}) vs Item(${i.latitude}, ${i.longitude})`);
        const distance = calculateDistance(currentLatitude, currentLongitude, i.latitude, i.longitude);
        // Log the calculated distance
        console.log(`    -> Calculated Distance (Random): ${distance}`);
        return {
            ...i,
            distance: distance
        }
      })
      .sort(() => 0.5 - Math.random()) // Shuffle array
      .slice(0, 5); // Take first 5 random items
    
    itemsToDisplay = randomItems;
  }
  
  // Final limit to 5 items
  itemsToDisplay = itemsToDisplay.slice(0, 5);

  // If still no items, return null
  if (itemsToDisplay.length === 0) {
    return null; 
  }

  return (
    <aside className="w-full md:w-80 lg:w-96 flex-shrink-0">
      <div className="md:sticky md:top-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">
          {sameLocationItems.length > 0 ? "Also in this Location" : "You might also like"}
        </h3>
        <ul className="space-y-4">
          {itemsToDisplay.map((item) => {
            // Log distance calculated for item before display
            console.log(`  Displaying ${item.name} with distance: ${item.distance}, Type: ${typeof item.distance}`);
            const distanceDisplay = typeof item.distance === 'number' // Check if distance is a valid number
                ? `${item.distance.toFixed(1)} km away` // Adjust 'km' to 'miles' if needed
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
                        
                        {/* Add Rating and Reviews Count */}
                        {(item.rating || item.reviews) && (
                            <div className="flex items-center text-sm text-gray-500 mb-1">
                                {item.rating && (
                                    <span className="text-yellow-500 mr-1">★ {item.rating.toFixed(1)}</span>
                                )}
                                {item.reviews && (
                                    <span className="ml-1">({item.reviews} reviews)</span>
                                )}
                            </div>
                        )}

                        {/* Highlighted Distance */}
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