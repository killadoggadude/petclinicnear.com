import Head from 'next/head'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import Breadcrumbs from '../../components/Breadcrumbs' // Adjust path if needed

// Helper function to parse CSV data (simple implementation)
function parseCsv(csvData) {
  const lines = csvData.trim().split(/\r?\n/);
  if (lines.length < 2) return []; // No data rows

  const header = lines[0].split(',').map(h => h.trim());
  const titleIndex = header.indexOf('title');
  const slugIndex = header.indexOf('slug');
  const contentIndex = header.indexOf('content');
  const dateIndex = header.indexOf('date');

  if (titleIndex === -1 || slugIndex === -1 || contentIndex === -1 || dateIndex === -1) {
    console.error("CSV header missing required columns (title, slug, content, date)");
    return [];
  }

  const posts = [];
  for (let i = 1; i < lines.length; i++) {
    // Basic split, assumes no commas within fields or uses quoting
    // A more robust parser would handle quoted fields properly
    const values = lines[i].split(','); 
    if (values.length === header.length) {
      posts.push({
        title: values[titleIndex].trim(),
        slug: values[slugIndex].trim(),
        content: values[contentIndex].trim(), // Content might need more processing later
        date: values[dateIndex].trim(),
        // Add placeholder for image if needed later
        // imageUrl: '...' 
      });
    } else {
        console.warn(`Skipping CSV line ${i+1} due to incorrect column count.`);
    }
  }
  // Sort posts by date, newest first (assuming YYYY-MM-DD format)
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  return posts;
}

export async function getStaticProps() {
  let posts = [];
  try {
    const dataPath = path.join(process.cwd(), 'data', 'blog_posts.csv');
    const csvData = fs.readFileSync(dataPath, 'utf-8');
    posts = parseCsv(csvData);
  } catch (error) {
    console.error("Error reading or parsing blog_posts.csv:", error);
    // Return empty props or handle error as needed
  }

  return {
    props: {
      posts: posts,
    },
  }
}

export default function BlogIndexPage({ posts }) {
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: null },
  ];

  return (
    <>
      <Head>
        <title>Blog - Pet Clinic Directory</title>
        <meta name="description" content="Read the latest articles and news from Pet Clinic Directory." />
      </Head>

      {/* Breadcrumb Section */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 py-8 px-4 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl">
          <Breadcrumbs crumbs={breadcrumbs} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white py-10 px-4 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Pet Care Blog</h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Tips, advice, and news for keeping your furry friends healthy and happy.
          </p>
        </div>
      </div>

      {/* Blog Grid Section */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div key={post.slug} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
                {/* Placeholder for Image - Remove or add actual image logic later */}
                {/* 
                <Link href={`/blog/${post.slug}`}> 
                   <span className="block relative w-full h-48 bg-gray-200"> 
                     {post.imageUrl && <Image src={post.imageUrl} alt={post.title} layout="fill" objectFit="cover" />} 
                   </span>
                 </Link> 
                 */}

                <div className="p-5 flex-grow flex flex-col">
                  <p className="text-sm text-gray-500 mb-2">
                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    <Link href={`/blog/${post.slug}`}>
                      <span className="hover:text-primary transition-colors duration-150">
                        {post.title}
                      </span>
                    </Link>
                  </h2>
                  {/* Optional: Add an excerpt here if desired */}
                  {/* <p className="text-gray-600 text-sm mb-4 flex-grow">Excerpt...</p> */}
                  <div className="mt-auto">
                    <Link href={`/blog/${post.slug}`}>
                      <span className="text-primary-600 hover:text-primary-800 font-medium text-sm">
                        Read More &rarr;
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No blog posts found.</p>
        )}
      </div>
    </>
  )
} 