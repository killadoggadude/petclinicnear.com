import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import fs from 'fs'
import path from 'path'
import Breadcrumbs from '../../components/Breadcrumbs' // Adjust path if needed
import ReactMarkdown from 'react-markdown' // To render markdown content

// Re-use the CSV parsing logic (or move to a shared lib/helper)
function parseCsv(csvData) {
  const lines = csvData.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map(h => h.trim());
  const titleIndex = header.indexOf('title');
  const slugIndex = header.indexOf('slug');
  const contentIndex = header.indexOf('content');
  const dateIndex = header.indexOf('date');
  if (titleIndex === -1 || slugIndex === -1 || contentIndex === -1 || dateIndex === -1) return [];
  const posts = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(','); 
    if (values.length === header.length) {
      posts.push({
        title: values[titleIndex].trim(),
        slug: values[slugIndex].trim(),
        content: values[contentIndex].trim(), 
        date: values[dateIndex].trim(),
      });
    } 
  }
  return posts;
}

export async function getStaticPaths() {
  let posts = [];
  try {
    const dataPath = path.join(process.cwd(), 'data', 'blog_posts.csv');
    const csvData = fs.readFileSync(dataPath, 'utf-8');
    posts = parseCsv(csvData);
  } catch (error) {
    console.error("Error reading blog CSV for paths:", error);
  }

  const paths = posts.map(post => ({
    params: { slug: post.slug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  let post = null;
  try {
    const dataPath = path.join(process.cwd(), 'data', 'blog_posts.csv');
    const csvData = fs.readFileSync(dataPath, 'utf-8');
    const posts = parseCsv(csvData);
    post = posts.find(p => p.slug === params.slug) || null;
  } catch (error) {
    console.error(`Error reading blog CSV for slug ${params.slug}:`, error);
  }

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
          <header className="mb-6 pb-4 border-b border-gray-200">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{post.title}</h1>
            <p className="text-sm text-gray-500">
              Published on {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </header>

          {/* Render Markdown Content */}
          <div className="prose prose-lg max-w-none prose-indigo">
             {/* Basic ReactMarkdown usage - customize further if needed */}
             <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
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