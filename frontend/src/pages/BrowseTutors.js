import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Search, MapPin, DollarSign, Coins, Star, User } from 'lucide-react';
import { api } from '@/utils/api';

export default function BrowseTutors({ user }) {
  const [tutors, setTutors] = useState([]);
  const [filters, setFilters] = useState({
    subject: '',
    location: '',
    minFee: '',
    maxFee: ''
  });

  useEffect(() => {
    loadTutors();
  }, []);

  const loadTutors = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.subject) params.append('subject', filters.subject);
      if (filters.location) params.append('location', filters.location);
      if (filters.minFee) params.append('min_fee', filters.minFee);
      if (filters.maxFee) params.append('max_fee', filters.maxFee);
      
      const response = await api.get(`/tutors?${params.toString()}`);
      setTutors(response.data);
    } catch (error) {
      console.error('Failed to load tutors:', error);
    }
  };

  const handleSearch = () => {
    loadTutors();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-white/20 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-outfit font-bold">Tricity Tutors</span>
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <Link to="/wallet">
                <Button data-testid="browse-wallet-btn" variant="outline" className="rounded-full flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-600" />
                  <span className="font-semibold">{user?.coins || 0}</span>
                </Button>
              </Link>
            )}
            {user ? (
              <Link to={user.role === 'tutor' ? '/tutor/dashboard' : '/student/dashboard'}>
                <Button data-testid="browse-back-btn" variant="outline" className="rounded-full">
                  Back to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button data-testid="browse-login-btn" className="bg-primary hover:bg-primary/90 rounded-full">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-outfit font-bold mb-2">Find Your Perfect Tutor</h1>
          <p className="text-muted-foreground">Browse qualified tutors in the Chandigarh region</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                data-testid="search-subject-input"
                placeholder="Subject (e.g., Math, Physics)"
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              />
              <Input
                data-testid="search-location-input"
                placeholder="Location (e.g., Chandigarh)"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
              <Input
                data-testid="search-min-fee-input"
                type="number"
                placeholder="Min Fee"
                value={filters.minFee}
                onChange={(e) => setFilters({ ...filters, minFee: e.target.value })}
              />
              <Input
                data-testid="search-max-fee-input"
                type="number"
                placeholder="Max Fee"
                value={filters.maxFee}
                onChange={(e) => setFilters({ ...filters, maxFee: e.target.value })}
              />
            </div>
            <Button data-testid="search-tutors-btn" onClick={handleSearch} className="mt-4 rounded-full" size="lg">
              Search Tutors
            </Button>
          </CardContent>
        </Card>

        {/* Tutors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No tutors found. Try adjusting your filters.</p>
            </div>
          ) : (
            tutors.map((tutor) => (
              <Card key={tutor.user_id} className="card-hover overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    {/* Profile Photo */}
                    <Avatar className="w-16 h-16 border-2 border-indigo-100">
                      <AvatarImage src={tutor.profile_photo} alt={tutor.name} />
                      <AvatarFallback className="text-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {tutor.name?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg mb-1 truncate">{tutor.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{tutor.location || 'Location not set'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold text-sm">{tutor.average_rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-xs text-gray-400">({tutor.reviews?.length || 0})</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">₹{tutor.fee_min || 0} - ₹{tutor.fee_max || 0}/hr</span>
                    </div>
                    {tutor.languages && tutor.languages.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Languages:</span>
                        <span className="ml-2">{tutor.languages.join(', ')}</span>
                      </div>
                    )}
                    {tutor.subjects && tutor.subjects.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Subjects:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tutor.subjects.slice(0, 3).map((sub, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {sub.subject}
                            </Badge>
                          ))}
                          {tutor.subjects.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{tutor.subjects.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-1 flex-wrap mt-2">
                      {tutor.teaches_online && <Badge variant="outline" className="text-xs">Online</Badge>}
                      {tutor.teaches_at_home && <Badge variant="outline" className="text-xs">Home Tuition</Badge>}
                    </div>
                  </div>
                  <Link to={`/tutors/${tutor.user_id}`} className="block">
                    <Button data-testid={`view-full-profile-${tutor.user_id}-btn`} className="w-full rounded-full">
                      View Full Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
