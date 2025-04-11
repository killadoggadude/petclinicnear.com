import Head from 'next/head';
import Link from 'next/link';
import Breadcrumbs from '../components/Breadcrumbs';

export default function TermsPage() {
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Terms of Service', href: null },
  ];
  const lastUpdated = "April 10, 2025"; // Update this date when changes are made

  return (
    <>
      <Head>
        <title>Terms of Service - Pet Clinic Directory</title>
        <meta name="description" content="Terms of Service for using our Pet Clinic Directory." />
      </Head>

      {/* Hero Section - Apply light gray gradient */}
      <div className="bg-gradient-to-r from-gray-50 via-gray-100 to-gray-200 py-8 px-4 border-b border-gray-200">
        <div className="container mx-auto max-w-7xl">
          <Breadcrumbs crumbs={breadcrumbs} />
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-800">Terms of Service</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white p-8 rounded-lg shadow border border-gray-200 prose prose-lg max-w-none">
          <p className="text-sm text-gray-500">Last Updated: {lastUpdated}</p>
          
          <h2>Welcome!</h2>
          <p>
            Thanks for using our Pet Clinic Directory (referred to as the "Service"). These Terms of Service ("Terms") cover your use and access to our Service. By using our Service, you agree to be bound by these Terms. Please read them carefully.
          </p>

          <h3>1. Using Our Service</h3>
          <p>
            Our directory provides information about veterinary clinics and related services. This information is intended for general informational purposes only. While we strive for accuracy, we cannot guarantee that all information (including hours, services offered, contact details, ratings, or reviews) is always correct or up-to-date. Information is sourced from public data and user contributions and may change.
          </p>
          <p>
            <strong>Important:</strong> This Service is NOT a substitute for professional veterinary advice, diagnosis, or treatment. Always seek the advice of your veterinarian or other qualified health provider with any questions you may have regarding a pet's medical condition. Never disregard professional veterinary advice or delay in seeking it because of something you have read on this Service.
          </p>
          <p>
            You agree to use our Service responsibly and legally. Do not misuse our Service, for example, by trying to interfere with it, access it using a method other than the interface and instructions we provide, scraping data excessively, or submitting false information.
          </p>

          <h3>2. Listings and Information Accuracy</h3>
          <p>
            The directory listings are provided "as is". We do not endorse, recommend, or guarantee the quality of service of any specific clinic listed. Business information, including operating hours and services, can change frequently. We strongly recommend you call a clinic directly to verify details before visiting.
          </p>
          <p>
            Ratings and reviews displayed are based on data from various sources or user submissions and reflect the opinions of others. They do not constitute an endorsement by us. We are not responsible for the content of third-party reviews or websites linked from our Service.
          </p>

          <h3>3. Your Responsibilities</h3>
          <p>
            You are solely responsible for your interactions with any clinic found through our Service. We are not involved in any transactions or agreements between you and the clinics. Any disputes must be resolved directly between you and the relevant clinic.
          </p>

          <h3>4. Intellectual Property</h3>
          <p>
            The content on our Service, including text, graphics, logos, and software (excluding user-submitted content or publicly sourced data), is the property of the Pet Clinic Directory or its licensors and is protected by copyright and other intellectual property laws. You may not reuse our content without explicit permission.
          </p>

          <h3>5. Disclaimers and Limitation of Liability</h3>
          <p>
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. 
          </p>
          <p>
            TO THE FULLEST EXTENT PERMITTED BY LAW, PET CLINIC DIRECTORY, ITS OWNERS, AND AFFILIATES WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (A) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (B) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE, INCLUDING WITHOUT LIMITATION, ANY DEFAMATORY, OFFENSIVE OR ILLEGAL CONDUCT OF OTHER USERS OR THIRD PARTIES; OR (C) UNAUTHORIZED ACCESS, USE OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT.
          </p>

          <h3>6. Changes to These Terms</h3>
          <p>
            We may modify these Terms from time to time. We will post the most current version on our site. If a revision meaningfully reduces your rights, we will notify you (e.g., by posting on our website or sending an email). By continuing to use the Service after the revisions come into effect, you agree to be bound by the revised Terms.
          </p>

          <h3>7. Governing Law</h3>
          <p>
            These Terms shall be governed by the laws of [Your State/Country, e.g., the State of California], without regard to its conflict of laws principles. 
          </p>
          
          <h3>8. Contact</h3>
          <p>
            If you have any questions about these Terms, please contact us via our <Link href="/contact"><a>Contact page</a></Link>.
          </p>
        </div>
      </div>
    </>
  );
} 