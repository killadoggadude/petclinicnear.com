import Head from 'next/head';
import Link from 'next/link';
import Breadcrumbs from '../components/Breadcrumbs';

export default function AboutPage() {
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: null },
  ];

  return (
    <>
      <Head>
        <title>About Us - Pet Clinic Directory</title>
        <meta name="description" content="Learn more about the team and mission behind our Pet Clinic Directory." />
      </Head>

      {/* Hero Section - Apply light gray gradient */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 py-8 px-4 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl">
          <Breadcrumbs crumbs={breadcrumbs} />
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-800">About Our Directory</h1>
        </div>
      </div>

      {/* Main Content - Apply bg-white here, adjust padding, keep prose */}
      <div className="container mx-auto px-4 py-12 max-w-4xl bg-white">
        <div className="prose prose-lg max-w-none">
          <h2>Connecting Pet Parents with Great Care</h2>
          <p>
            Hey there, fellow animal lover! We started this Pet Clinic Directory for one simple reason: we know how much your furry (or feathery, or scaly!) friend means to you. Finding the right veterinarian or clinic shouldn't add stress when your pet needs care. It's tough sifting through endless search results, trying to figure out who's nearby, who's highly rated, and who really understands your pet's needs.
          </p>
          <p>
            We've been there. That late-night panic when your dog eats something strange, or the annual check-up scramble. We wanted to build something genuinely helpful – a straightforward place to find reliable veterinary clinics in your area. Think of us as that helpful neighbor who knows all the local spots.
          </p>
          <h3>What We Do</h3>
          <p>
            Our goal is to list trusted pet clinics, making it easy for you to find contact information, see what services are offered (as much detail as we can gather!), and get a sense of their reputation through ratings and reviews. We focus on providing the essential details so you can make informed decisions quickly.
          </p>
          <p>
            This directory is a labor of love, built by pet people, for pet people. We're constantly working to keep the information accurate and add more clinics. It's not about fancy algorithms; it's about community and making sure every pet gets the best possible care.
          </p>
          <h3>Get in Touch</h3>
          <p>
            Have a suggestion for a clinic we should add, or feedback on how we can improve? We'd genuinely love to hear from you! Head over to our <Link href="/contact">Contact page</Link> and drop us a line. Thanks for stopping by!
          </p>
        </div>
      </div>
    </>
  );
} 