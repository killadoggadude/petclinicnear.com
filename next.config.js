/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export configuration
  // output: 'export', 
  reactStrictMode: true,
  // Required for optimized image handling with static export if using external URLs
  images: {
    // Keep optimization enabled (no unoptimized: true)
    // Configure allowed domains
    domains: [
        'lh3.googleusercontent.com', 
        'streetviewpixels-pa.googleapis.com' 
        // Add any other domains you use for images
    ], 
  },
}

module.exports = nextConfig 