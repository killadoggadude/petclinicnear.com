import StaticPageLayout from '../components/StaticPageLayout'; // Adjust path if needed

export default function ContactPage() {
  return (
    <StaticPageLayout title="Contact Us" description="Get in touch with DirectoryTemplate.">
      <h2>Get in Touch</h2>
      <p>If you have questions, feedback, or need support, please reach out to us.</p>
      
      <p><strong>Email:</strong> <a href="mailto:hello@seokrauts.com">hello@seokrauts.com</a></p>
      
      <h3>Business Hours</h3>
      <p>Monday - Friday: 9:00 AM - 5:00 PM (Local Time)</p>

      {/* You could add a contact form component here later */}
    </StaticPageLayout>
  );
} 