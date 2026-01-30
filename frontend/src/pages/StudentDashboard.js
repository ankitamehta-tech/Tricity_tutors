import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GraduationCap, Plus, Coins, MessageSquare, Search, X, LogOut, Mail, AlertCircle, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { api, logout } from '@/utils/api';

const tricityLocations = [
  // Chandigarh (grouped)
  'Chandigarh - Sector 1-10', 'Chandigarh - Sector 11-20', 'Chandigarh - Sector 21-30',
  'Chandigarh - Sector 31-40', 'Chandigarh - Sector 41-50', 'Chandigarh - Sector 51-56',
  'Chandigarh - Manimajra', 'Chandigarh - Dhanas', 'Chandigarh - Maloya', 'Chandigarh - IT Park',
  'Chandigarh - PGI Area', 'Chandigarh - Industrial Area',
  // Mohali
  'Mohali - Phase 1-5', 'Mohali - Phase 6-11', 'Mohali - Sector 58-70', 'Mohali - Sector 71-80',
  'Mohali - Sector 81-91', 'Mohali - Aerocity', 'Mohali - IT City', 'Mohali - Kharar Road',
  'Mohali - Airport Road', 'Mohali - VR Punjab', 'Mohali - Balongi', 'Mohali - Sohana',
  // Panchkula
  'Panchkula - Sector 1-10', 'Panchkula - Sector 11-20', 'Panchkula - Sector 21-28',
  'Panchkula - MDC', 'Panchkula - Pinjore', 'Panchkula - Kalka', 'Panchkula - Barwala',
  // Zirakpur
  'Zirakpur - VIP Road', 'Zirakpur - Baltana', 'Zirakpur - Pabhat', 'Zirakpur - Dhakoli',
  'Zirakpur - Peer Muchalla', 'Zirakpur - Gazipur', 'Zirakpur - NAC',
  // Nearby Areas
  'Kharar', 'Kharar - Landran', 'Derabassi', 'Mullanpur', 'New Chandigarh',
  'Nayagaon', 'Kurali', 'Morinda', 'Gharuan', 'Lalru', 'Rajpura'
];

export default function StudentDashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [myRequirements, setMyRequirements] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [emailOTP, setEmailOTP] = useState('');
  const [phoneOTP, setPhoneOTP] = useState('');
  const [currentUser, setCurrentUser] = useState(user);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requirementData, setRequirementData] = useState({
    subject: '',
    level_class: '',
    mode: [],  // Changed to array for multiple selections
    requirement_type: 'Tuition',
    gender_preference: 'Any',
    time_preference: 'Part Time',
    languages: ['English'],
    location: '',
    phone: '',
    description: ''
  });

  useEffect(() => {
    loadMyRequirements();
    loadTutors();
    loadUnreadCount();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const response = await api.get('/me');
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  const loadMyRequirements = async () => {
    try {
      const response = await api.get('/requirements/my');
      setMyRequirements(response.data);
    } catch (error) {
      console.error('Failed to load requirements:', error);
    }
  };

  const loadTutors = async () => {
    try {
      const response = await api.get('/tutors');
      setTutors(response.data.slice(0, 6));
    } catch (error) {
      console.error('Failed to load tutors:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await api.get('/messages/unread');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handlePostRequirement = async (e) => {
    e.preventDefault();
    
    // Check email verification first
    if (!currentUser?.email_verified) {
      setShowEmailVerification(true);
      return;
    }
    
    // Validate phone number is 10 digits
    if (requirementData.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    // Email is verified, submit the requirement directly (no phone verification)
    await submitRequirement();
  };

  const sendEmailOTP = async () => {
    try {
      const response = await api.post(`/auth/send-otp?email=${user.email}&otp_type=email`);
      toast.success('OTP sent to your email! Please check your inbox.');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
    }
  };

  const verifyEmailOTP = async () => {
    try {
      await api.post('/auth/verify-otp', {
        email: user.email,
        otp: emailOTP,
        otp_type: 'email'
      });
      toast.success('Email verified successfully!');
      setShowEmailVerification(false);
      setEmailOTP('');
      
      // Update local user state
      setCurrentUser({ ...currentUser, email_verified: true });
      
      // Now proceed to submit the requirement (no phone verification needed)
      await submitRequirement();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    }
  };

  const sendPhoneOTP = async () => {
    // Function kept for backwards compatibility but not used
    toast.info('Mobile OTP verification has been removed. Email verification is sufficient.');
  };

  const submitRequirement = async () => {
    try {
      await api.post('/requirements', requirementData);
      toast.success('Requirement posted successfully!');
      setShowPostModal(false);
      setShowPhoneVerification(false);
      setPhoneOTP('');
      setRequirementData({
        subject: '',
        level_class: '',
        mode: 'Online',
        requirement_type: 'Tuition',
        gender_preference: 'Any',
        time_preference: 'Part Time',
        languages: ['English'],
        location: '',
        phone: '',
        description: ''
      });
      loadMyRequirements();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to post requirement');
    }
  };

  const verifyPhoneAndSubmit = async () => {
    // Skip phone verification, just submit directly
    await submitRequirement();
  };

  const handleDeleteRequirement = async (reqId) => {
    try {
      await api.delete(`/requirements/${reqId}`);
      toast.success('Requirement closed');
      loadMyRequirements();
    } catch (error) {
      toast.error('Failed to close requirement');
    }
  };

  const handleContactTutor = async (tutorId) => {
    if (user.coins < 100) {
      toast.error('Insufficient coins. You need 100 coins to contact a tutor.');
      return;
    }
    
    try {
      const response = await api.post('/wallet/spend', null, {
        params: { coins: 100, purpose: 'contact_tutor', target_id: tutorId }
      });
      
      toast.success('Contact information unlocked!');
      const updatedUser = { ...user, coins: response.data.remaining_coins };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (response.data.data) {
        toast.info(`Mobile: ${response.data.data.mobile}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to unlock contact');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-white/20 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-outfit font-bold">Tricity Tutors</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/wallet">
              <Button data-testid="student-wallet-btn" variant="outline" className="rounded-full flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold">{user?.coins || 0}</span>
              </Button>
            </Link>
            <Link to="/messages">
              <Button data-testid="student-messages-btn" variant="outline" className="rounded-full relative">
                <MessageSquare className="w-4 h-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-500 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button data-testid="student-logout-btn" onClick={logout} variant="outline" className="rounded-full">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-outfit font-bold mb-2">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground">Find the perfect tutor for your needs</p>
          </div>
          <Dialog open={showPostModal} onOpenChange={setShowPostModal}>
            <DialogTrigger asChild>
              <Button data-testid="post-requirement-btn" className="bg-orange-500 hover:bg-orange-600 rounded-full flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Post Requirement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {showEmailVerification ? 'Verify Email First' : 'Post Your Requirement'}
                </DialogTitle>
                <DialogDescription>
                  {showEmailVerification 
                    ? 'Email verification is required before posting a requirement' 
                    : 'Fill in the details to find the perfect tutor'}
                </DialogDescription>
              </DialogHeader>
              
              {showEmailVerification ? (
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">
                        Email Verification Required
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Please verify your email ({user.email}) before posting a requirement.
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email-otp">Enter Email OTP</Label>
                    <Input
                      data-testid="email-otp-input"
                      id="email-otp"
                      value={emailOTP}
                      onChange={(e) => setEmailOTP(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      data-testid="send-email-otp-btn"
                      onClick={sendEmailOTP}
                      variant="outline"
                      className="w-full rounded-full"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send OTP to Email
                    </Button>
                    <Button
                      data-testid="verify-email-btn"
                      onClick={verifyEmailOTP}
                      className="w-full bg-orange-500 hover:bg-orange-600 rounded-full"
                      disabled={!emailOTP || emailOTP.length < 6}
                    >
                      Verify Email
                    </Button>
                    <Button
                      data-testid="cancel-email-verify-btn"
                      onClick={() => {
                        setShowEmailVerification(false);
                        setShowPostModal(false);
                      }}
                      variant="outline"
                      className="w-full rounded-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : !showPhoneVerification ? (
                <form onSubmit={handlePostRequirement} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Subject</Label>
                    <Input
                      data-testid="req-subject-input"
                      value={requirementData.subject}
                      onChange={(e) => setRequirementData({ ...requirementData, subject: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Level/Class</Label>
                    <Input
                      data-testid="req-level-input"
                      value={requirementData.level_class}
                      onChange={(e) => setRequirementData({ ...requirementData, level_class: e.target.value })}
                      placeholder="e.g., Class 10, B.Tech"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Mode</Label>
                    <Select value={requirementData.mode} onValueChange={(value) => setRequirementData({ ...requirementData, mode: value })}>
                      <SelectTrigger data-testid="req-mode-select" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Online">Online</SelectItem>
                        <SelectItem value="Home">Home Tuition</SelectItem>
                        <SelectItem value="I can travel">I can travel to tutor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Requirement Type</Label>
                    <Select value={requirementData.requirement_type} onValueChange={(value) => setRequirementData({ ...requirementData, requirement_type: value })}>
                      <SelectTrigger data-testid="req-type-select" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tuition">Tuition</SelectItem>
                        <SelectItem value="Assignment Help">Assignment Help</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Gender Preference</Label>
                    <Select value={requirementData.gender_preference} onValueChange={(value) => setRequirementData({ ...requirementData, gender_preference: value })}>
                      <SelectTrigger data-testid="req-gender-select" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any">Any</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Time Preference</Label>
                    <Select value={requirementData.time_preference} onValueChange={(value) => setRequirementData({ ...requirementData, time_preference: value })}>
                      <SelectTrigger data-testid="req-time-select" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Part Time">Part Time</SelectItem>
                        <SelectItem value="Full Time">Full Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Location *</Label>
                    <select
                      data-testid="req-location-select"
                      value={requirementData.location}
                      onChange={(e) => setRequirementData({ ...requirementData, location: e.target.value })}
                      className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background"
                      required
                    >
                      <option value="">Select Location</option>
                      {tricityLocations.map((loc, idx) => (
                        <option key={idx} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      data-testid="req-phone-input"
                      type="tel"
                      value={requirementData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          setRequirementData({ ...requirementData, phone: value });
                        }
                      }}
                      placeholder="10-digit mobile number"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      className="mt-1"
                    />
                    {requirementData.phone && requirementData.phone.length !== 10 && (
                      <p className="text-xs text-red-500 mt-1">Mobile number must be exactly 10 digits</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Languages (comma separated)</Label>
                  <Input
                    data-testid="req-languages-input"
                    value={requirementData.languages.join(', ')}
                    onChange={(e) => setRequirementData({ ...requirementData, languages: e.target.value.split(',').map(l => l.trim()) })}
                    placeholder="English, Hindi, Punjabi"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    data-testid="req-description-input"
                    value={requirementData.description}
                    onChange={(e) => setRequirementData({ ...requirementData, description: e.target.value })}
                    placeholder="Additional details about your requirement"
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <Button data-testid="submit-requirement-btn" type="submit" className="w-full bg-orange-500 hover:bg-orange-600 rounded-full">
                  Post Requirement
                </Button>
              </form>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Processing your requirement...</strong>
                    </p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="requirements" className="space-y-8">
          <TabsList className="bg-white border shadow-sm p-1">
            <TabsTrigger data-testid="requirements-tab" value="requirements" className="rounded-lg">My Requirements</TabsTrigger>
            <TabsTrigger data-testid="browse-tab" value="browse" className="rounded-lg">Browse Tutors</TabsTrigger>
          </TabsList>

          {/* My Requirements Tab */}
          <TabsContent value="requirements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Posted Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myRequirements.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">You haven't posted any requirements yet</p>
                      <Button data-testid="post-first-requirement-btn" onClick={() => setShowPostModal(true)} className="bg-orange-500 hover:bg-orange-600 rounded-full">
                        Post Your First Requirement
                      </Button>
                    </div>
                  ) : (
                    myRequirements.map((req) => (
                      <div key={req.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{req.subject}</h3>
                            <p className="text-sm text-muted-foreground">{req.level_class} • {req.mode}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={req.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                              {req.status}
                            </Badge>
                            {req.status === 'active' && (
                              <Button
                                data-testid={`delete-requirement-${req.id}-btn`}
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteRequirement(req.id)}
                                className="rounded-full"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm mb-2">{req.description}</p>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>{req.location}</span>
                          <span>{new Date(req.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Browse Tutors Tab */}
          <TabsContent value="browse" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-outfit font-bold">Available Tutors</h2>
              <Link to="/tutors">
                <Button data-testid="view-all-tutors-btn" variant="outline" className="rounded-full flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  View All Tutors
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutors.map((tutor) => (
                <Card key={tutor.user_id} className="card-hover">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{tutor.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{tutor.location}</p>
                      </div>
                      <Badge className="bg-yellow-500">{tutor.average_rating?.toFixed(1) || '0.0'} ⭐</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Fee:</span>
                        <span className="ml-2 font-semibold">₹{tutor.fee_min} - ₹{tutor.fee_max}/hr</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Languages:</span>
                        <span className="ml-2">{tutor.languages?.join(', ') || 'Not specified'}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Link to={`/tutors/${tutor.user_id}`} className="flex-1">
                          <Button data-testid={`view-tutor-${tutor.user_id}-btn`} variant="outline" className="w-full rounded-full" size="sm">
                            View Profile
                          </Button>
                        </Link>
                        <Button
                          data-testid={`contact-tutor-${tutor.user_id}-btn`}
                          size="sm"
                          onClick={() => handleContactTutor(tutor.user_id)}
                          className="flex-1 rounded-full bg-orange-500 hover:bg-orange-600"
                        >
                          Contact (100 coins)
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
