import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsConditions() {
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
        <h1 className="text-4xl font-outfit font-bold mb-8">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-6">Last updated: January 2026</p>

        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using Tricity Tutors, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>Tricity Tutors is an online platform that connects tutors with students in Chandigarh, Mohali, Panchkula, Zirakpur, and nearby areas. We provide:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A marketplace for tutors to list their services</li>
              <li>A platform for students to find and connect with tutors</li>
              <li>A coin-based system for accessing tutor contacts and student requirements</li>
              <li>Messaging and review features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p>To use certain features, you must create an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Coin System & Payments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Coins are used to access tutor contacts (100 coins) and student requirements (200 coins)</li>
              <li>Coin purchases are processed securely via Razorpay</li>
              <li>All payments are in Indian Rupees (INR)</li>
              <li>Coins are non-transferable between accounts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Tutor Responsibilities</h2>
            <p>Tutors using our platform agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information about qualifications and experience</li>
              <li>Deliver quality tutoring services as described</li>
              <li>Respond professionally to student inquiries</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Student Responsibilities</h2>
            <p>Students using our platform agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate tutoring requirements</li>
              <li>Communicate respectfully with tutors</li>
              <li>Make payments for services as agreed with tutors</li>
              <li>Provide honest reviews and feedback</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Prohibited Activities</h2>
            <p>Users may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Post false or misleading information</li>
              <li>Harass or abuse other users</li>
              <li>Use the platform for illegal activities</li>
              <li>Attempt to bypass the coin system</li>
              <li>Scrape or copy platform content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p>Tricity Tutors is a platform that connects tutors and students. We are not responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The quality of tutoring services provided</li>
              <li>Disputes between tutors and students</li>
              <li>Any damages arising from use of the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p>For any questions about these Terms, please contact us at:</p>
            <p className="font-semibold">Email: support@tricitytutors.com</p>
            <p className="font-semibold">Location: Chandigarh, India</p>
          </section>
        </div>
      </div>
    </div>
  );
}
