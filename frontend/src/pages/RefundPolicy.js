import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RefundPolicy() {
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
        <h1 className="text-4xl font-outfit font-bold mb-8">Refund & Cancellation Policy</h1>
        <p className="text-muted-foreground mb-6">Last updated: January 2026</p>

        <div className="prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Coin Purchases</h2>
            <p>When you purchase coins on Tricity Tutors:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All coin purchases are final and non-refundable once the transaction is complete</li>
              <li>Coins are credited instantly to your account after successful payment</li>
              <li>Unused coins remain in your account indefinitely and do not expire</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Refund Eligibility</h2>
            <p>Refunds may be considered in the following cases:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Technical errors:</strong> If coins were not credited despite successful payment</li>
              <li><strong>Double charges:</strong> If you were charged multiple times for the same transaction</li>
              <li><strong>Unauthorized transactions:</strong> If your account was compromised</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Non-Refundable Scenarios</h2>
            <p>Refunds will NOT be provided for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Coins already spent on viewing requirements or contacting tutors</li>
              <li>Change of mind after purchase</li>
              <li>Dissatisfaction with tutor services (this is between you and the tutor)</li>
              <li>Account suspension due to policy violations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Refund Process</h2>
            <p>To request a refund:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Email us at <strong>support@tricitytutors.com</strong> within 7 days of the transaction</li>
              <li>Include your registered email, transaction ID, and reason for refund</li>
              <li>We will review your request within 3-5 business days</li>
              <li>If approved, refund will be processed to the original payment method within 7-10 business days</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Cancellation of Services</h2>
            <p>You may delete your account at any time. Upon account deletion:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Any remaining coins in your wallet will be forfeited</li>
              <li>Your profile and data will be permanently deleted</li>
              <li>No refunds will be provided for unused coins</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Tutor-Student Disputes</h2>
            <p>Tricity Tutors is a platform connecting tutors and students. For disputes regarding:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Quality of tutoring services</li>
              <li>Payments made directly to tutors</li>
              <li>Scheduling or attendance issues</li>
            </ul>
            <p className="mt-2">These matters should be resolved directly between the tutor and student. Tricity Tutors is not responsible for refunds related to tutoring services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
            <p>For refund requests or questions about this policy:</p>
            <p className="font-semibold">Email: support@tricitytutors.com</p>
            <p className="font-semibold">Response Time: 24-48 hours</p>
            <p className="font-semibold">Location: Chandigarh, India</p>
          </section>
        </div>
      </div>
    </div>
  );
}
