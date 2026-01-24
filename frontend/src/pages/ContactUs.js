import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactUs() {
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
        <h1 className="text-4xl font-outfit font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground mb-8">We'd love to hear from you. Get in touch with us for any questions or support.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-600" />
                Email Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">support@tricitytutors.com</p>
              <p className="text-muted-foreground">We typically respond within 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-indigo-600" />
                Call Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">+91-XXXXXXXXXX</p>
              <p className="text-muted-foreground">Mon-Sat, 9 AM - 6 PM IST</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">Chandigarh, India</p>
              <p className="text-muted-foreground">Serving Tricity: Chandigarh, Mohali, Panchkula, Zirakpur</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">Monday - Saturday</p>
              <p className="text-muted-foreground">9:00 AM - 6:00 PM IST</p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-indigo-50 rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">How do I become a tutor on Tricity Tutors?</h3>
              <p className="text-muted-foreground">Sign up as a tutor, complete your profile with education and experience details, and start connecting with students.</p>
            </div>
            
            <div>
              <h3 className="font-semibold">How does the coin system work?</h3>
              <p className="text-muted-foreground">Students need 100 coins to contact a tutor. Tutors need 200 coins to view student requirements. Coins can be purchased in various packages.</p>
            </div>
            
            <div>
              <h3 className="font-semibold">Is my payment information secure?</h3>
              <p className="text-muted-foreground">Yes, all payments are processed securely through Razorpay, a trusted payment gateway. We never store your card details.</p>
            </div>
            
            <div>
              <h3 className="font-semibold">What areas do you serve?</h3>
              <p className="text-muted-foreground">We serve the entire Tricity region including Chandigarh, Mohali, Panchkula, Zirakpur, and nearby areas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
