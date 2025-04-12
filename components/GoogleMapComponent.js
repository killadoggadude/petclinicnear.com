import React from 'react';

export default function GoogleMapComponent({ latitude, longitude, name, address }) {
  // Log received coordinates for debugging
  console.log('Original Iframe Map Component Received:', { latitude, longitude });

  const hasValidCoordinates = typeof latitude === 'number' && typeof longitude === 'number';
  let mapUrl;
  let directionsUrl = null;

  if (hasValidCoordinates) {
    // Use specific location with marker if coordinates are valid
    // Increase the offset from 0.01 to 0.08 to zoom out
    const offset = 0.08; 
    const bbox = `${longitude-offset},${latitude-offset},${longitude+offset},${latitude+offset}`;
    mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
    directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  } else {
    // Use a generic, wider view if coordinates are missing (e.g., centered loosely on US)
    console.warn('Map Component: Invalid or missing coordinates. Displaying generic map.');
    // Display a placeholder or message instead of a generic map
    return (
      <div className="w-full h-[250px] bg-gray-100 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 mb-4">
         Location data not available for map.
      </div>
   );
    // mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=-125,25,-65,50&layer=mapnik`; // Removed generic map fallback
  }

  return (
    <div className="w-full h-full">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm w-full h-full">
        {/* Map Iframe using OpenStreetMap */}
        <div className="w-full h-full relative">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src={mapUrl} // This will only be set if coordinates are valid
            style={{ border: 0, width: '100%', height: '100%' }} // Ensure explicit width/height styles
            title={`Map showing location of ${name}`}
            loading="lazy" // Add lazy loading
          ></iframe>
        </div>
        
        {/* Optional: Show caption/overlay ONLY if we have coordinates */}
        {/* Removing this overlay as it might obscure the map 
        {hasValidCoordinates && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pointer-events-none">
            <div className="text-white text-sm font-medium">{name}</div>
            {address && <div className="text-white/80 text-xs">{address}</div>}
          </div>
        )}
        */}
        
        {/* Show Get Directions Link ONLY if we have coordinates */}
        {hasValidCoordinates && directionsUrl && (
          <a 
            href={directionsUrl} 
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 bg-white rounded-md shadow px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 flex items-center z-10" // Added z-10
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Directions
          </a>
        )}
        {/* Removed the !hasValidCoordinates overlay as the component returns early */}
      </div>
    </div>
  );
} 