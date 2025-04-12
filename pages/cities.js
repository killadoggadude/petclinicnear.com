import Head from 'next/head'
import Link from 'next/link'
import Breadcrumbs from '../components/Breadcrumbs' // Adjust path if needed

export async function getStaticProps() {
  // Require fs and path here
  const fs = require('fs');
  const path = require('path');

  let cities = [];
  let allItems = [];

  try {
      const dataPath = path.join(process.cwd(), 'data', 'processed_data.json');
      const jsonData = fs.readFileSync(dataPath, 'utf-8'); // Specify encoding
      const processedData = JSON.parse(jsonData);
      cities = processedData?.cities || [];
      allItems = processedData?.allItems || []; // Get allItems
  } catch (error) {
      console.error("Error reading processed data for cities page:", error);
      // Handle error appropriately, maybe return empty props
  }

  // --- Group cities by state --- 
  const statesMap = {};
  cities.forEach(city => {
    const stateName = city.state || 'Unknown State';
    if (!statesMap[stateName]) {
      statesMap[stateName] = { name: stateName, cities: [] };
    }
    statesMap[stateName].cities.push({ 
        name: city.name, 
        slug: city.slug, 
        itemCount: typeof city.itemCount === 'number' ? city.itemCount : 0,
        stateName: city.state
    });
  });
  const statesWithCities = Object.values(statesMap).sort((a, b) => a.name.localeCompare(b.name));
  statesWithCities.forEach(state => {
      state.cities.sort((a, b) => a.name.localeCompare(b.name));
  });
  // --- End Grouping ---

  const totalCityCount = cities.length;
  const totalItemCount = allItems.length; // Calculate total items

  return {
    props: {
      statesWithCities: statesWithCities, 
      totalCityCount: totalCityCount,
      totalItemCount: totalItemCount, // Pass totalItemCount
    },
  }
}

export default function AllCitiesPage({ statesWithCities, totalCityCount, totalItemCount }) { // Add totalItemCount prop
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'All Cities', href: null }, 
  ];

  return (
    <>
      <Head>
        {/* Update title dynamically? */}
        <title>All {totalCityCount} Cities - Pet Clinic Directory</title>
        <meta name="description" content={`Browse listings across ${totalCityCount} cities and ${totalItemCount} pet clinics.`} />
      </Head>

      {/* Top Hero (Breadcrumbs only) */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 py-8 px-4 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl">
          <Breadcrumbs crumbs={breadcrumbs} />
        </div>
      </div>

      {/* Reverted Hero Section */}
      <div className="bg-white py-10 px-4 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl text-center">
          {/* Update H1 with both counts */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Best {totalItemCount} Pet Clinics in {totalCityCount} Cities</h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Find trusted pet clinics and veterinary services across numerous cities. Explore options in your area using the list below.
          </p>
        </div>
      </div>

      {/* Main Content Area - Grouped by State */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {statesWithCities && statesWithCities.length > 0 ? (
          <div className="space-y-10"> {/* Space between states */} 
            {statesWithCities.map((state) => (
              <section key={state.name}>
                {/* State Heading (H2, not linked) */}
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Pet Clinics in {state.name}
                </h2>
                {/* Grid for cities within the state */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {state.cities.map((city) => (
                    // Ensure Link uses /[citySlug]
                    <Link key={city.slug} href={`/${city.slug}`}>
                      <span className="block p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition duration-150 ease-in-out cursor-pointer">
                        <h3 className="text-lg font-semibold text-gray-800 hover:text-blue-600">Pet Clinics in {city.name}</h3> 
                        <p className="text-sm text-gray-500 mt-1">
                          {city.itemCount || 0} {city.itemCount === 1 ? 'Veterinarian' : 'Veterinarians'}
                        </p>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No cities found.</p>
        )}
      </div>
    </>
  )
} 