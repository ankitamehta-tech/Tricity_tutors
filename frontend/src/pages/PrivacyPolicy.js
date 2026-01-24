import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="backdrop-blur-xl bg-white/70 border-b border-white/20 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-outfit font-bold">Tricity Tutors</span>
          </Link>
          <Link to="/">
            <Button variant="outline" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-outfit font-bold mb-8">Privacy Policy</h1>
        <p className="text-muted-foreground mb-6">Last updated: January 2026</p>

        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>Welcome to Tricity Tutors. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p>We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name, email address, and phone number</li>
              <li>Profile information (for tutors: education, experience, subjects)</li>
              <li>Payment information (processed securely via Razorpay)</li>
              <li>Messages and communications on our platform</li>
              <li>Reviews and ratings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Connect tutors with students</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Respond to your comments and questions</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
            <p>We do not sell your personal information. We may share information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Other users (tutors/students) to facilitate connections</li>
              <li>Service providers (Razorpay for payments, Resend for emails)</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information, including encryption, secure servers, and regular security assessments.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p>For any questions about this Privacy Policy, please contact us at:</p>
            <p className="font-semibold">Email: support@tricitytutors.com</p>
            <p className="font-semibold">Location: Chandigarh, India</p>
          </section>
        </div>
      </div>
    </div>
  );
}
