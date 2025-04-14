import React from 'react';

export default function GoogleMapComponent({ latitude, longitude, name, address }) {
  // Log received coordinates for debugging
  // console.log('Google Map Component Received:', { latitude, longitude });

  // Get API Key from environment variables (must be prefixed with NEXT_PUBLIC_)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const hasValidCoordinates = typeof latitude === 'number' && typeof longitude === 'number';
  let mapEmbedUrl = null;
  let directionsUrl = null;

  if (!apiKey) {
      console.error("Google Maps API Key (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) is missing.");
      // Display an error message if the key is missing
      return (
        <div className="w-full h-full bg-gray-100 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center text-center text-red-600 p-4">
          Map cannot be displayed. <br /> API key configuration error.
        </div>
     );
  }

  if (hasValidCoordinates) {
    // Construct Google Maps Embed URL using coordinates with zoom level 12 (4 steps zoomed out from default)
    mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}&zoom=12`;
    // Construct Google Maps Directions URL
    directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  } else {
    console.warn('Map Component: Invalid or missing coordinates. Cannot display map.');
    // Display a placeholder if coordinates are missing
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 p-4">
         Location data not available for map.
      </div>
   );
  }

  return (
    <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm w-full aspect-square">
        {/* Map Iframe using Google Maps Embed API */}
        <div className="w-full h-full relative">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapEmbedUrl}
            title={`Google Map showing location of ${name}`}
            className="absolute inset-0"
          ></iframe>
        </div>
        
        {/* Get Directions Link */}
        {directionsUrl && (
          <a 
            href={directionsUrl} 
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 bg-white rounded-md shadow px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 flex items-center z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Directions
          </a>
        )}
      </div>
    </div>
  );
} 