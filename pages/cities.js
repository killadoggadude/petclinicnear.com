import Head from 'next/head'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import Breadcrumbs from '../components/Breadcrumbs' // Adjust path if needed

// Helper function to read the processed data
function getProcessedData() {
  const dataPath = path.join(process.cwd(), 'data', 'processed_data.json');
  try {
      const jsonData = fs.readFileSync(dataPath);
      const data = JSON.parse(jsonData);
      // Read the top-level cities array
      return { cities: data.cities || [] }; 
  } catch (error) {
      console.error("Error reading processed data for cities page:", error);
      // Return empty cities array on error
      return { cities: [] }; 
  }
}

export async function getStaticProps() {
  const data = getProcessedData();
  const allCities = data.cities; 

  // --- Group cities by state --- 
  const statesMap = {};
  allCities.forEach(city => {
    const stateName = city.state || 'Unknown State'; // Use state name from city object
    if (!statesMap[stateName]) {
      statesMap[stateName] = { name: stateName, cities: [] };
    }
    statesMap[stateName].cities.push({ 
        name: city.name, 
        slug: city.slug, 
        itemCount: typeof city.itemCount === 'number' ? city.itemCount : 0,
        stateName: city.state // Keep state name if needed, though parent has it
    });
  });
  const statesWithCities = Object.values(statesMap).sort((a, b) => a.name.localeCompare(b.name));
  statesWithCities.forEach(state => {
      state.cities.sort((a, b) => a.name.localeCompare(b.name));
  });
  // --- End Grouping ---

  const totalCityCount = allCities.length;

  return {
    props: {
      // Pass the grouped structure and total count
      statesWithCities: statesWithCities, 
      totalCityCount: totalCityCount,
      // Remove the flat cities list
      // cities: allCities, 
    },
  }
}

export default function AllCitiesPage({ statesWithCities, totalCityCount }) {
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'All Cities', href: null }, // Current page
  ];

  return (
    <>
      <Head>
        <title>All Cities - Directory</title>
        <meta name="description" content="Browse listings by city across all states." />
      </Head>

      {/* Top Hero (Breadcrumbs only) - Apply light gray gradient */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 py-8 px-4 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl">
          <Breadcrumbs crumbs={breadcrumbs} />
        </div>
      </div>

      {/* Reverted Hero Section */}
      <div className="bg-white py-10 px-4 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Best {totalCityCount} Pet Clinics by City</h1>
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