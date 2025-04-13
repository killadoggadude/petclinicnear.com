import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/Layout'; // Assuming Layout is in components
import ListingCard from '../components/ListingCard'; // Assuming ListingCard is in components
import fs from 'fs';
import path from 'path';

// Helper function to perform search logic (case-insensitive)
function searchItems(items, query) {
    if (!query) {
        return []; // Return empty if no query
    }
    const lowerCaseQuery = query.toLowerCase();
    return items.filter(item => {
        // Search in relevant fields: name, city, state, description (add more if needed)
        return (
            item.name?.toLowerCase().includes(lowerCaseQuery) ||
            item.city?.toLowerCase().includes(lowerCaseQuery) ||
            item.state?.toLowerCase().includes(lowerCaseQuery) ||
            item.description?.toLowerCase().includes(lowerCaseQuery) ||
            item.postal_code?.toLowerCase().includes(lowerCaseQuery)
        );
    });
}

export async function getServerSideProps(context) {
    const { q } = context.query; // Get query 'q' from URL: /search?q=...
    const searchQuery = q || '';

    let allItems = [];
    let searchResults = [];
    let error = null;

    try {
        // Load data from processed_data.json (adjust path if needed)
        const dataPath = path.join(process.cwd(), 'data', 'processed_data.json');
        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        const processedData = JSON.parse(jsonData);
        allItems = processedData?.allItems || []; 
        
        // Perform search
        if (searchQuery) {
            searchResults = searchItems(allItems, searchQuery);
        }

    } catch (err) {
        console.error("Error loading data or searching:", err);
        error = "Failed to load search results. Please try again later.";
        // Decide if you want to return an error status code
        // context.res.statusCode = 500; 
    }

    return {
        props: {
            searchQuery,
            searchResults,
            error,
            // totalResults: searchResults.length // Optionally pass total count
        },
    };
}

export default function SearchPage({ searchQuery, searchResults, error }) {
    const router = useRouter(); // Can be used for further client-side interactions if needed

    // Handle potential loading state or error from getServerSideProps
    if (error) {
       return (
            <Layout>
                <div className="container mx-auto px-4 py-12 max-w-7xl">
                    <h1 className="text-2xl font-semibold mb-4">Search Error</h1>
                    <p className="text-red-600">{error}</p>
                </div>
            </Layout>
       );
    }

    return (
        <Layout>
            <Head>
                <title>{searchQuery ? `Search Results for "${searchQuery}"` : 'Search'} - Pet Clinic Directory</title>
                <meta name="description" content={`Find pet clinics matching "${searchQuery}" in our directory.`} />
                 {/* Prevent indexing of search results pages if desired */}
                 {/* <meta name="robots" content="noindex, follow" /> */}
            </Head>

            <div className="container mx-auto px-4 py-12 max-w-7xl">
                <h1 className="text-3xl font-semibold mb-6">
                    {searchQuery 
                        ? `Search Results for "${searchQuery}"` 
                        : 'Search Pet Clinics'}
                </h1>

                {/* Optional: Show search input again? */}

                {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {searchResults.map(item => (
                            // Assuming ListingCard exists and accepts 'item' prop
                           // Check if ListingCard needs a key, likely item.slug or a unique ID
                            <ListingCard key={`${item.citySlug}-${item.slug}`} item={item} /> 
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">
                        {searchQuery 
                            ? `No results found for "${searchQuery}". Try searching for a different term.`
                            : 'Please enter a search term above.'} 
                    </p>
                )}
            </div>
        </Layout>
    );
} 