import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import fs from 'fs'
import path from 'path'
import Papa from 'papaparse' // Import papaparse
import Image from 'next/image' // Import Image component
import Breadcrumbs from '../../components/Breadcrumbs' // Adjust path if needed

// Helper to get all parsed posts (can be moved to a lib)
function getAllBlogPosts() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'blog_posts.csv');
    const csvData = fs.readFileSync(dataPath, 'utf-8');
    const parsedData = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim().toLowerCase().replace(/\s+/g, '_'), // Normalize headers
    });

    if (parsedData.errors.length > 0) {
        console.error("Papaparse errors:", parsedData.errors);
    }

    if (parsedData.data && Array.isArray(parsedData.data)) {
        // Check for normalized headers
        return parsedData.data
          .filter(row => row.title && row.slug && row.content && row.date)
          .map(row => ({
            title: row.title.trim(),
            slug: row.slug.trim(),
            content: row.content.trim(),
            date: row.date.trim(),
            // Construct image path assuming images are in public/featured_images
            imageUrl: row.featured_image ? `/featured_images/${row.featured_image.trim()}` : null, 
          }));
    } 
  } catch (error) {
    console.error("Error reading or parsing blog_posts.csv in getAllBlogPosts:", error);
  }
  return []; // Return empty array on error or if no data
}

export async function getStaticPaths() {
  const posts = getAllBlogPosts();
  const paths = posts.map(post => ({
    params: { slug: post.slug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const posts = getAllBlogPosts();
  const post = posts.find(p => p.slug === params.slug) || null;

  if (!post) {
    return { notFound: true };
  }

  return {
    props: {
      post,
    },
  }
}

export default function BlogPostPage({ post }) {
  const router = useRouter();

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: post.title, href: null }, // Current post title
  ];

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>{post.title} - Blog | Pet Clinic Directory</title>
        {/* Add meta description from content excerpt if desired */}
        {/* <meta name="description" content={post.content.substring(0, 155) + '...'} /> */}
      </Head>

      {/* Breadcrumb Section */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 py-8 px-4 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl">
          <Breadcrumbs crumbs={breadcrumbs} />
        </div>
      </div>

      {/* Main Post Content Area */}
      <div className="container mx-auto px-4 py-12 max-w-4xl"> {/* Centered, max-width for readability */}
        <article className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200">
          {/* Featured Image Added Here */} 
          {post.imageUrl && (
             <div className="relative w-full h-64 md:h-80 mb-6 rounded-md overflow-hidden"> 
                <Image 
                    src={post.imageUrl}
                    alt={post.title} 
                    layout="fill" 
                    objectFit="contain"
                    priority // Prioritize loading for hero image
                />
             </div>
          )}
          
          <header className="mb-6 pb-4 border-b border-gray-200">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{post.title}</h1>
            <p className="text-sm text-gray-500">
              Published on {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </header>

          {/* Render HTML Content using dangerouslySetInnerHTML */}
          <div 
            className="prose prose-lg max-w-none prose-indigo" 
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
        </article>

        {/* Back to Blog Link */}
        <div className="mt-8">
          <Link href="/blog">
            <span className="text-primary-600 hover:text-primary-800 hover:underline">&larr; Back to Blog</span>
          </Link>
        </div>
      </div>
    </>
  )
} 