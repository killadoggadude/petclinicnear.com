import Link from 'next/link';
import Image from 'next/image';

// --- Component for Listing Card --- 
export default function ListingCard({ item }) {
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
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" 
                        priority={true} // Consider making priority conditional if many cards load
                    />
                </Link>
            )}
            {!item.imageUrl && (
                <div className="w-full h-40 relative flex-shrink-0 block bg-gray-100 flex items-center justify-center">
                    {/* Placeholder Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}> <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /> </svg>
                </div>
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