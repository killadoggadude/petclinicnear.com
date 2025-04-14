import Head from 'next/head'
import Link from 'next/link'
import Breadcrumbs from '../components/Breadcrumbs' // Adjust path if needed
import { getProcessedData } from '../lib/data'; // Assuming data helper exists

export async function getStaticProps() {
  const data = getProcessedData();
  const allItems = data.allItems || [];

  // --- Calculate State Data ---
  const stateCounts = {};
  allItems.forEach(item => {
    const stateName = item.state || 'Unknown State';
    if (stateName !== 'Unknown State') { // Only count items with a valid state
      stateCounts[stateName] = (stateCounts[stateName] || 0) + 1;
    }
  });

  const states = Object.entries(stateCounts).map(([name, count]) => ({
    name: name,
    slug: name.toLowerCase().replace(/\s+/g, '-'), // Simple slug generation
    itemCount: count,
  })).sort((a, b) => a.name.localeCompare(b.name)); // Sort states alphabetically
  // --- End Calculate State Data ---

  const totalStateCount = states.length;
  const totalItemCount = allItems.length;

  return {
    props: {
      states: states,
      totalStateCount: totalStateCount,
      totalItemCount: totalItemCount,
    },
  }
}

export default function AllStatesPage({ states, totalStateCount, totalItemCount }) {
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'All States', href: null }, // Updated breadcrumb
  ];

  return (
    <>
      <Head>
        {/* Updated title */}
        <title>All {totalStateCount} States - Pet Clinic Directory</title>
        <meta name="description" content={`Browse listings across ${totalStateCount} states and ${totalItemCount} pet clinics.`} />
      </Head>

      {/* Top Hero (Breadcrumbs only) */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 py-8 px-4 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl">
          <Breadcrumbs crumbs={breadcrumbs} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white py-10 px-4 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl text-center">
          {/* Updated H1 */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Best {totalItemCount} Pet Clinics in {totalStateCount} States</h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Find trusted pet clinics and veterinary services across numerous states. Explore options in your area using the list below.
          </p>
        </div>
      </div>

      {/* Main Content Area - List of States */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {states && states.length > 0 ? (
          // Grid for states
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {states.map((state) => (
              // Placeholder Link - Needs actual state page route if desired, otherwise just display info
              // For now, let's just display the info without linking. Add Link later if needed.
              <div key={state.slug} className="block p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition duration-150 ease-in-out">
                <h2 className="text-lg font-semibold text-gray-800">Pet Clinics in {state.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {state.itemCount || 0} {state.itemCount === 1 ? 'Veterinarian' : 'Veterinarians'}
                </p>
              </div>
              // <Link key={state.slug} href={`/state/${state.slug}`}> // Example if linking later
              //   <span className="... cursor-pointer">...</span>
              // </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No states found.</p>
        )}
      </div>
    </>
  )
} 