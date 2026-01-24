import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, MapPin, Star, Coins, BookOpen, Video, MessageSquare } from 'lucide-react';

export default function LandingPage({ user }) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-white/20 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-outfit font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Tricity Tutors
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button
                  data-testid="dashboard-btn"
                  onClick={() => window.location.href = user.role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard'}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-full font-semibold shadow-lg shadow-indigo-500/20 btn-hover"
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button data-testid="get-started-btn" className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-full font-semibold shadow-lg shadow-indigo-500/20 btn-hover">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-orange-500/10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-outfit font-bold leading-tight mb-6">
                Find Tutors in
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Tricity, Chandigarh, Mohali and Panchkula
                </span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Connect with experienced tutors and teachers across all domains in Chandigarh, Mohali, Panchkula, Zirakpur and nearby areas. Quality education at your doorstep or online.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/auth">
                  <Button data-testid="find-tutor-btn" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-10 rounded-full font-semibold shadow-lg shadow-indigo-500/20 btn-hover">
                    Find a Tutor
                  </Button>
                </Link>
                <Link to="/tutors">
                  <Button data-testid="browse-tutors-btn" size="lg" variant="outline" className="h-12 px-10 rounded-full font-medium">
                    Browse Tutors
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1675664533677-2f3479b85c20?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Student learning"
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-outfit font-bold mb-4">Why Choose Tricity Tutors?</h2>
            <p className="text-lg text-muted-foreground">Everything you need to find or become a tutor</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Feature 1 */}
            <div className="md:col-span-6 bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all card-hover border">
              <MapPin className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-2xl font-outfit font-bold mb-3">Local Focus</h3>
              <p className="text-muted-foreground leading-relaxed">
                Specifically designed for Chandigarh, Mohali, Panchkula, Zirakpur regions. Find tutors near you easily.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="md:col-span-6 bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all card-hover border">
              <Users className="w-12 h-12 text-orange-500 mb-4" />
              <h3 className="text-2xl font-outfit font-bold mb-3">Verified Tutors</h3>
              <p className="text-muted-foreground leading-relaxed">
                All tutors are verified with education credentials and experience. Read reviews from real students.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="md:col-span-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all card-hover border">
              <Video className="w-10 h-10 text-indigo-600 mb-3" />
              <h3 className="text-xl font-outfit font-bold mb-2">Online & Home</h3>
              <p className="text-sm text-muted-foreground">
                Choose between online classes or home tuition
              </p>
            </div>

            {/* Feature 4 */}
            <div className="md:col-span-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all card-hover border">
              <Coins className="w-10 h-10 text-orange-500 mb-3" />
              <h3 className="text-xl font-outfit font-bold mb-2">Coin System</h3>
              <p className="text-sm text-muted-foreground">
                Affordable coin packages to connect with tutors
              </p>
            </div>

            {/* Feature 5 */}
            <div className="md:col-span-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all card-hover border">
              <MessageSquare className="w-10 h-10 text-purple-600 mb-3" />
              <h3 className="text-xl font-outfit font-bold mb-2">Direct Contact</h3>
              <p className="text-sm text-muted-foreground">
                Message tutors directly and schedule classes
              </p>
            </div>

            {/* Feature 6 */}
            <div className="md:col-span-8 bg-card rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all card-hover border">
              <Star className="w-12 h-12 text-yellow-500 mb-4" />
              <h3 className="text-2xl font-outfit font-bold mb-3">Rating & Reviews</h3>
              <p className="text-muted-foreground leading-relaxed">
                Transparent rating system helps you choose the best tutor. Students can rate and review after every session.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="md:col-span-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all card-hover border">
              <BookOpen className="w-10 h-10 text-green-600 mb-3" />
              <h3 className="text-xl font-outfit font-bold mb-2">All Domains</h3>
              <p className="text-sm text-muted-foreground">
                Nursery to PhD, Yoga, Music, Dance, Arts, Languages, Skills - Every subject, every level
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-outfit font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl mb-10 opacity-90">
            Join hundreds of students and tutors in the Tricity region
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/auth">
              <Button data-testid="cta-student-btn" size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 h-12 px-10 rounded-full font-semibold btn-hover">
                Sign Up as Student
              </Button>
            </Link>
            <Link to="/auth">
              <Button data-testid="cta-tutor-btn" size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 h-12 px-10 rounded-full font-semibold">
                Sign Up as Tutor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="w-6 h-6 text-indigo-600" />
                <span className="text-xl font-outfit font-bold">Tricity Tutors</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Connecting qualified tutors with students in Chandigarh, Mohali, Panchkula, and Zirakpur.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/tutors" className="text-muted-foreground hover:text-indigo-600">Browse Tutors</Link></li>
                <li><Link to="/auth" className="text-muted-foreground hover:text-indigo-600">Sign Up</Link></li>
                <li><Link to="/login" className="text-muted-foreground hover:text-indigo-600">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-indigo-600">Privacy Policy</Link></li>
                <li><Link to="/terms-conditions" className="text-muted-foreground hover:text-indigo-600">Terms & Conditions</Link></li>
                <li><Link to="/refund-policy" className="text-muted-foreground hover:text-indigo-600">Refund Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contact-us" className="text-muted-foreground hover:text-indigo-600">Contact Us</Link></li>
                <li><span className="text-muted-foreground">support@tricitytutors.com</span></li>
                <li><span className="text-muted-foreground">Chandigarh, India</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2026 Tricity Tutors. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
