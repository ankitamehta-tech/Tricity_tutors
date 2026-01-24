import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Plus, X, Save, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/utils/api';

const commonSubjects = [
  // Academic Subjects
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Social Science',
  'Computer Science', 'Accountancy', 'Business Studies', 'Economics', 'History', 'Geography',
  'Political Science', 'Psychology', 'Sociology', 'Physical Education', 'Sanskrit', 'French',
  'German', 'Spanish', 'Engineering', 'Medical', 'Law', 'Commerce', 'Arts', 'Science',
  // Early Education
  'Nursery Education', 'Kindergarten', 'Pre-School', 'Play School', 'Montessori',
  // Music & Arts
  'Music - Vocal', 'Music - Instrumental', 'Guitar', 'Piano', 'Keyboard', 'Drums', 'Tabla',
  'Harmonium', 'Violin', 'Flute', 'Classical Music', 'Western Music', 'Hindustani Music',
  'Carnatic Music', 'Painting', 'Drawing', 'Sketching', 'Calligraphy', 'Arts & Crafts',
  // Dance & Fitness
  'Dance - Classical', 'Dance - Contemporary', 'Bharatanatyam', 'Kathak', 'Odissi',
  'Hip Hop', 'Salsa', 'Ballet', 'Yoga', 'Meditation', 'Fitness', 'Gym Training',
  'Aerobics', 'Zumba', 'Martial Arts', 'Karate', 'Taekwondo',
  // Languages
  'English Speaking', 'IELTS', 'TOEFL', 'Spoken English', 'Business English',
  'German Language', 'French Language', 'Spanish Language', 'Japanese', 'Korean',
  'Mandarin', 'Arabic', 'Punjabi', 'Urdu',
  // Professional Skills
  'Coding', 'Programming', 'Web Development', 'App Development', 'Data Science',
  'Machine Learning', 'Artificial Intelligence', 'Digital Marketing', 'Photography',
  'Videography', 'Graphic Design', 'UI/UX Design', 'Content Writing', 'Public Speaking',
  // Special Skills
  'Chess', 'Cooking', 'Baking', 'Stitching', 'Embroidery', 'Interior Design',
  'Fashion Design', 'Jewellery Making', 'Pottery', 'Gardening',
  // Competitive Exams
  'IIT-JEE', 'NEET', 'CAT', 'GATE', 'UPSC', 'SSC', 'Banking Exams', 'Railway Exams',
  // Other
  'Other'
];

const commonLanguages = [
  'English', 'Hindi', 'Punjabi', 'Urdu', 'Sanskrit', 'French', 'German', 'Spanish',
  'Mandarin', 'Japanese', 'Korean', 'Arabic', 'Bengali', 'Tamil', 'Telugu', 'Malayalam',
  'Kannada', 'Marathi', 'Gujarati', 'Odia', 'Assamese'
];

const tricityLocations = [
  // Chandigarh
  'Chandigarh - Sector 1', 'Chandigarh - Sector 2', 'Chandigarh - Sector 3', 'Chandigarh - Sector 4', 'Chandigarh - Sector 5',
  'Chandigarh - Sector 6', 'Chandigarh - Sector 7', 'Chandigarh - Sector 8', 'Chandigarh - Sector 9', 'Chandigarh - Sector 10',
  'Chandigarh - Sector 11', 'Chandigarh - Sector 12', 'Chandigarh - Sector 14', 'Chandigarh - Sector 15', 'Chandigarh - Sector 16',
  'Chandigarh - Sector 17', 'Chandigarh - Sector 18', 'Chandigarh - Sector 19', 'Chandigarh - Sector 20', 'Chandigarh - Sector 21',
  'Chandigarh - Sector 22', 'Chandigarh - Sector 23', 'Chandigarh - Sector 24', 'Chandigarh - Sector 25', 'Chandigarh - Sector 26',
  'Chandigarh - Sector 27', 'Chandigarh - Sector 28', 'Chandigarh - Sector 29', 'Chandigarh - Sector 30', 'Chandigarh - Sector 31',
  'Chandigarh - Sector 32', 'Chandigarh - Sector 33', 'Chandigarh - Sector 34', 'Chandigarh - Sector 35', 'Chandigarh - Sector 36',
  'Chandigarh - Sector 37', 'Chandigarh - Sector 38', 'Chandigarh - Sector 39', 'Chandigarh - Sector 40', 'Chandigarh - Sector 41',
  'Chandigarh - Sector 42', 'Chandigarh - Sector 43', 'Chandigarh - Sector 44', 'Chandigarh - Sector 45', 'Chandigarh - Sector 46',
  'Chandigarh - Sector 47', 'Chandigarh - Sector 48', 'Chandigarh - Sector 49', 'Chandigarh - Sector 50', 'Chandigarh - Sector 51',
  'Chandigarh - Sector 52', 'Chandigarh - Sector 53', 'Chandigarh - Sector 54', 'Chandigarh - Sector 55', 'Chandigarh - Sector 56',
  'Chandigarh - Manimajra', 'Chandigarh - Dhanas', 'Chandigarh - Maloya', 'Chandigarh - Daria', 'Chandigarh - Hallomajra',
  'Chandigarh - Kaimbwala', 'Chandigarh - Khuda Ali Sher', 'Chandigarh - Burail', 'Chandigarh - Attawa',
  'Chandigarh - IT Park', 'Chandigarh - PGI', 'Chandigarh - Panjab University Campus', 'Chandigarh - Industrial Area Phase 1',
  'Chandigarh - Industrial Area Phase 2', 'Chandigarh - Grain Market',
  // Mohali
  'Mohali - Phase 1', 'Mohali - Phase 2', 'Mohali - Phase 3A', 'Mohali - Phase 3B', 'Mohali - Phase 4', 'Mohali - Phase 4A',
  'Mohali - Phase 5', 'Mohali - Phase 6', 'Mohali - Phase 7', 'Mohali - Phase 8', 'Mohali - Phase 8A', 'Mohali - Phase 8B',
  'Mohali - Phase 9', 'Mohali - Phase 10', 'Mohali - Phase 11', 'Mohali - Sector 58', 'Mohali - Sector 59',
  'Mohali - Sector 60', 'Mohali - Sector 61', 'Mohali - Sector 62', 'Mohali - Sector 63', 'Mohali - Sector 64',
  'Mohali - Sector 65', 'Mohali - Sector 66', 'Mohali - Sector 67', 'Mohali - Sector 68', 'Mohali - Sector 69',
  'Mohali - Sector 70', 'Mohali - Sector 71', 'Mohali - Sector 72', 'Mohali - Sector 74', 'Mohali - Sector 76',
  'Mohali - Sector 77', 'Mohali - Sector 78', 'Mohali - Sector 79', 'Mohali - Sector 80', 'Mohali - Sector 82',
  'Mohali - Sector 86', 'Mohali - Sector 88', 'Mohali - Sector 91', 'Mohali - Aerocity', 'Mohali - IT City',
  'Mohali - VR Punjab', 'Mohali - Kharar Road', 'Mohali - Airport Road', 'Mohali - Balongi', 'Mohali - Sohana',
  // Panchkula
  'Panchkula - Sector 1', 'Panchkula - Sector 2', 'Panchkula - Sector 3', 'Panchkula - Sector 4', 'Panchkula - Sector 5',
  'Panchkula - Sector 6', 'Panchkula - Sector 7', 'Panchkula - Sector 8', 'Panchkula - Sector 9', 'Panchkula - Sector 10',
  'Panchkula - Sector 11', 'Panchkula - Sector 12', 'Panchkula - Sector 12A', 'Panchkula - Sector 14', 'Panchkula - Sector 15',
  'Panchkula - Sector 16', 'Panchkula - Sector 17', 'Panchkula - Sector 18', 'Panchkula - Sector 19', 'Panchkula - Sector 20',
  'Panchkula - Sector 21', 'Panchkula - Sector 25', 'Panchkula - Sector 26', 'Panchkula - Sector 27', 'Panchkula - Sector 28',
  'Panchkula - MDC', 'Panchkula - Pinjore', 'Panchkula - Kalka', 'Panchkula - Barwala', 'Panchkula - Ramgarh',
  // Zirakpur
  'Zirakpur - VIP Road', 'Zirakpur - Baltana', 'Zirakpur - Pabhat', 'Zirakpur - Dhakoli', 'Zirakpur - Peer Muchalla',
  'Zirakpur - Gazipur', 'Zirakpur - Lohgarh', 'Zirakpur - NAC', 'Zirakpur - Maya Garden City', 'Zirakpur - PR7 Airport Road',
  // Nearby Areas
  'Kharar', 'Kharar - Landran', 'Kharar - Banur', 'Derabassi', 'Derabassi - Industrial Area', 'Mullanpur',
  'Mullanpur - New Chandigarh', 'New Chandigarh - Omaxe', 'New Chandigarh - DLF', 'Nayagaon', 'Naya Gaon - Sector 1',
  'Naya Gaon - Sector 2', 'Kurali', 'Morinda', 'Gharuan', 'Lalru', 'Rajpura',
  // Villages & Rural Areas
  'Village Behlana', 'Village Manauli', 'Village Sarangpur', 'Village Khuda Lahora', 'Village Khuda Jassu',
  'Village Dadumajra', 'Village Kishangarh', 'Village Majri', 'Village Raipur Khurd', 'Village Raipur Kalan'
];

// Class levels organized by category
const classCategories = {
  'PRE-SCHOOL': ['Playgroup', 'Nursery', 'LKG', 'UKG'],
  'PRIMARY': ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
  'MIDDLE SCHOOL': ['Class 6', 'Class 7', 'Class 8'],
  'SECONDARY': ['Class 9', 'Class 10'],
  'SENIOR SECONDARY': ['Class 11', 'Class 12'],
  'UNDERGRADUATE': ['UG Year 1', 'UG Year 2', 'UG Year 3', 'UG Year 4'],
  'POSTGRADUATE': ['PG Year 1', 'PG Year 2'],
  'DOCTORAL': ['PhD']
};

// Flat list for backward compatibility
const classOptions = [
  'Playgroup', 'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8',
  'Class 9', 'Class 10',
  'Class 11', 'Class 12',
  'UG Year 1', 'UG Year 2', 'UG Year 3', 'UG Year 4',
  'PG Year 1', 'PG Year 2',
  'PhD',
  'Beginner', 'Intermediate', 'Advanced', 'Professional',
  'All Ages', 'Kids (3-10)', 'Teens (11-17)', 'Adults (18+)'
];

export default function TutorProfileEdit({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    mobile: '',
    gender: '',
    location: '',
    education: {
      tenth: { school: '', board: '', year: '' },
      twelfth: { school: '', board: '', year: '' },
      graduation: { degree: '', college: '', year: '' },
      postgraduation: { degree: '', college: '', year: '' },
      phd: { specialization: '', university: '', year: '' },
      diploma: { course: '', institute: '', year: '' },
      other_courses: []
    },
    experience: [],
    subjects: [],
    languages: [],
    fee_min: 0,
    fee_max: 0,
    can_travel: false,
    teaches_online: false,
    online_experience: '',
    teaches_at_home: false,
    homework_help: false,
    works_as: '',
    total_teaching_exp: '',
    intro_video_url: ''
  });

  const [newExperience, setNewExperience] = useState({ role: '', company_institute: '', duration: '' });
  const [newSubject, setNewSubject] = useState({ subject: '', classes: [] });
  const [newCourse, setNewCourse] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/tutor/profile');
      setProfileData(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    // Validate mandatory fields
    if (!profileData.name || !profileData.mobile || !profileData.location) {
      toast.error('Please fill all required fields: Name, Mobile, Location');
      return;
    }
    
    if (profileData.mobile.length !== 10) {
      toast.error('Mobile number must be exactly 10 digits');
      return;
    }
    
    if (!profileData.subjects || profileData.subjects.length === 0) {
      toast.error('Please add at least one subject you can teach');
      return;
    }
    
    if (!profileData.fee_min || !profileData.fee_max || profileData.fee_min === 0 || profileData.fee_max === 0) {
      toast.error('Please set your fee range (minimum and maximum per hour)');
      return;
    }
    
    if (profileData.fee_min >= profileData.fee_max) {
      toast.error('Maximum fee must be greater than minimum fee');
      return;
    }
    
    setLoading(true);
    try {
      await api.put('/tutor/profile', profileData);
      toast.success('Profile updated successfully!');
      navigate('/tutor/dashboard');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addExperience = () => {
    if (newExperience.role && newExperience.company_institute && newExperience.duration) {
      setProfileData({
        ...profileData,
        experience: [...(profileData.experience || []), newExperience]
      });
      setNewExperience({ role: '', company_institute: '', duration: '' });
      toast.success('Experience added');
    }
  };

  const removeExperience = (index) => {
    const updated = [...profileData.experience];
    updated.splice(index, 1);
    setProfileData({ ...profileData, experience: updated });
  };

  const addSubject = () => {
    if (newSubject.subject && newSubject.classes.length > 0) {
      setProfileData({
        ...profileData,
        subjects: [...(profileData.subjects || []), newSubject]
      });
      setNewSubject({ subject: '', classes: [] });
      setSubjectSearch('');
      toast.success('Subject added');
    }
  };

  const removeSubject = (index) => {
    const updated = [...profileData.subjects];
    updated.splice(index, 1);
    setProfileData({ ...profileData, subjects: updated });
  };

  const addCourse = () => {
    if (newCourse) {
      const courses = profileData.education?.other_courses || [];
      setProfileData({
        ...profileData,
        education: {
          ...profileData.education,
          other_courses: [...courses, newCourse]
        }
      });
      setNewCourse('');
    }
  };

  const removeCourse = (index) => {
    const courses = [...(profileData.education?.other_courses || [])];
    courses.splice(index, 1);
    setProfileData({
      ...profileData,
      education: { ...profileData.education, other_courses: courses }
    });
  };

  const addLanguage = () => {
    const lang = newLanguage.trim();
    if (lang && !profileData.languages?.includes(lang)) {
      // Check if it's a valid language
      const isValidLanguage = commonLanguages.some(l => 
        l.toLowerCase() === lang.toLowerCase()
      ) || lang.length > 2; // Allow custom languages if more than 2 chars
      
      if (!isValidLanguage) {
        toast.error('Please enter a valid language name');
        return;
      }
      
      setProfileData({
        ...profileData,
        languages: [...(profileData.languages || []), lang]
      });
      setNewLanguage('');
      setLanguageSearch('');
    }
  };

  const removeLanguage = (index) => {
    const updated = [...(profileData.languages || [])];
    updated.splice(index, 1);
    setProfileData({ ...profileData, languages: updated });
  };

  const filteredLanguages = commonLanguages.filter(l => 
    l.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const toggleClass = (className) => {
    const classes = newSubject.classes || [];
    if (classes.includes(className)) {
      setNewSubject({ ...newSubject, classes: classes.filter(c => c !== className) });
    } else {
      setNewSubject({ ...newSubject, classes: [...classes, className] });
    }
  };

  const filteredSubjects = commonSubjects.filter(s => 
    s.toLowerCase().includes(subjectSearch.toLowerCase())
  );

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
            <Link to="/wallet">
              <Button data-testid="profile-edit-wallet-btn" variant="outline" className="rounded-full flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold">{user?.coins || 0}</span>
              </Button>
            </Link>
            <Button data-testid="back-dashboard-btn" onClick={() => navigate('/tutor/dashboard')} variant="outline" className="rounded-full">
              Back to Dashboard
            </Button>
            <Button data-testid="save-profile-btn" onClick={handleSaveProfile} disabled={loading} className="bg-primary hover:bg-primary/90 rounded-full flex items-center gap-2">
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-outfit font-bold mb-8">Complete Your Profile</h1>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    data-testid="profile-name-input"
                    value={profileData.name || ''}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Mobile Number *</Label>
                  <Input
                    data-testid="profile-mobile-input"
                    type="tel"
                    value={profileData.mobile || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 10) {
                        setProfileData({ ...profileData, mobile: value });
                      }
                    }}
                    maxLength={10}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select value={profileData.gender || ''} onValueChange={(value) => setProfileData({ ...profileData, gender: value })}>
                    <SelectTrigger data-testid="profile-gender-select" className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Location *</Label>
                  <select
                    data-testid="profile-location-select"
                    value={profileData.location || ''}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
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
                  <Label>Works As</Label>
                  <Input
                    data-testid="profile-works-as-input"
                    value={profileData.works_as || ''}
                    onChange={(e) => setProfileData({ ...profileData, works_as: e.target.value })}
                    placeholder="Professional Tutor, Teacher, etc."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Total Teaching Experience</Label>
                  <Input
                    data-testid="profile-total-exp-input"
                    value={profileData.total_teaching_exp || ''}
                    onChange={(e) => setProfileData({ ...profileData, total_teaching_exp: e.target.value })}
                    placeholder="e.g., 5 years"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 10th */}
              <div>
                <h3 className="font-semibold mb-3">10th Standard</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>School Name</Label>
                    <Input
                      data-testid="education-10th-school-input"
                      value={profileData.education?.tenth?.school || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          tenth: { ...profileData.education?.tenth, school: e.target.value }
                        }
                      })}
                      placeholder="School name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Board</Label>
                    <Input
                      data-testid="education-10th-board-input"
                      value={profileData.education?.tenth?.board || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          tenth: { ...profileData.education?.tenth, board: e.target.value }
                        }
                      })}
                      placeholder="CBSE, ICSE, State Board"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      data-testid="education-10th-year-input"
                      value={profileData.education?.tenth?.year || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          tenth: { ...profileData.education?.tenth, year: e.target.value }
                        }
                      })}
                      placeholder="2015"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* 12th */}
              <div>
                <h3 className="font-semibold mb-3">12th Standard</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>School Name</Label>
                    <Input
                      data-testid="education-12th-school-input"
                      value={profileData.education?.twelfth?.school || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          twelfth: { ...profileData.education?.twelfth, school: e.target.value }
                        }
                      })}
                      placeholder="School name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Board</Label>
                    <Input
                      data-testid="education-12th-board-input"
                      value={profileData.education?.twelfth?.board || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          twelfth: { ...profileData.education?.twelfth, board: e.target.value }
                        }
                      })}
                      placeholder="CBSE, ICSE, State Board"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      data-testid="education-12th-year-input"
                      value={profileData.education?.twelfth?.year || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          twelfth: { ...profileData.education?.twelfth, year: e.target.value }
                        }
                      })}
                      placeholder="2017"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Graduation */}
              <div>
                <h3 className="font-semibold mb-3">Graduation</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Degree</Label>
                    <Input
                      data-testid="education-graduation-degree-input"
                      value={profileData.education?.graduation?.degree || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          graduation: { ...profileData.education?.graduation, degree: e.target.value }
                        }
                      })}
                      placeholder="B.Tech, B.Sc, B.Com, B.A"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>College/University</Label>
                    <Input
                      data-testid="education-graduation-college-input"
                      value={profileData.education?.graduation?.college || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          graduation: { ...profileData.education?.graduation, college: e.target.value }
                        }
                      })}
                      placeholder="College name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      data-testid="education-graduation-year-input"
                      value={profileData.education?.graduation?.year || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          graduation: { ...profileData.education?.graduation, year: e.target.value }
                        }
                      })}
                      placeholder="2021"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Post Graduation */}
              <div>
                <h3 className="font-semibold mb-3">Post Graduation</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Degree</Label>
                    <Input
                      data-testid="education-postgrad-degree-input"
                      value={profileData.education?.postgraduation?.degree || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          postgraduation: { ...profileData.education?.postgraduation, degree: e.target.value }
                        }
                      })}
                      placeholder="M.Tech, M.Sc, M.Com, M.A, MBA"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>College/University</Label>
                    <Input
                      data-testid="education-postgrad-college-input"
                      value={profileData.education?.postgraduation?.college || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          postgraduation: { ...profileData.education?.postgraduation, college: e.target.value }
                        }
                      })}
                      placeholder="College name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      data-testid="education-postgrad-year-input"
                      value={profileData.education?.postgraduation?.year || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          postgraduation: { ...profileData.education?.postgraduation, year: e.target.value }
                        }
                      })}
                      placeholder="2023"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* PhD */}
              <div>
                <h3 className="font-semibold mb-3">PhD</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Specialization</Label>
                    <Input
                      data-testid="education-phd-specialization-input"
                      value={profileData.education?.phd?.specialization || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          phd: { ...profileData.education?.phd, specialization: e.target.value }
                        }
                      })}
                      placeholder="Field of study"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>University</Label>
                    <Input
                      data-testid="education-phd-university-input"
                      value={profileData.education?.phd?.university || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          phd: { ...profileData.education?.phd, university: e.target.value }
                        }
                      })}
                      placeholder="University name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      data-testid="education-phd-year-input"
                      value={profileData.education?.phd?.year || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          phd: { ...profileData.education?.phd, year: e.target.value }
                        }
                      })}
                      placeholder="2025"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Diploma */}
              <div>
                <h3 className="font-semibold mb-3">Diploma</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Course</Label>
                    <Input
                      data-testid="education-diploma-course-input"
                      value={profileData.education?.diploma?.course || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          diploma: { ...profileData.education?.diploma, course: e.target.value }
                        }
                      })}
                      placeholder="Diploma course name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Institute</Label>
                    <Input
                      data-testid="education-diploma-institute-input"
                      value={profileData.education?.diploma?.institute || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          diploma: { ...profileData.education?.diploma, institute: e.target.value }
                        }
                      })}
                      placeholder="Institute name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input
                      data-testid="education-diploma-year-input"
                      value={profileData.education?.diploma?.year || ''}
                      onChange={(e) => setProfileData({ 
                        ...profileData, 
                        education: { 
                          ...profileData.education, 
                          diploma: { ...profileData.education?.diploma, year: e.target.value }
                        }
                      })}
                      placeholder="2020"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Other Courses / Certifications</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    data-testid="add-course-input"
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    placeholder="Add certification or course"
                  />
                  <Button data-testid="add-course-btn" type="button" onClick={addCourse} size="sm" className="rounded-full">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profileData.education?.other_courses?.map((course, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {course}
                      <button data-testid={`remove-course-${idx}-btn`} onClick={() => removeCourse(idx)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle>Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.experience?.map((exp, idx) => (
                <div key={idx} className="p-4 border rounded-lg flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{exp.role}</h4>
                    <p className="text-sm text-muted-foreground">{exp.company_institute}</p>
                    <p className="text-sm text-muted-foreground">{exp.duration}</p>
                  </div>
                  <Button data-testid={`remove-exp-${idx}-btn`} variant="ghost" size="sm" onClick={() => removeExperience(idx)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  data-testid="exp-role-input"
                  value={newExperience.role}
                  onChange={(e) => setNewExperience({ ...newExperience, role: e.target.value })}
                  placeholder="Role"
                />
                <Input
                  data-testid="exp-company-input"
                  value={newExperience.company_institute}
                  onChange={(e) => setNewExperience({ ...newExperience, company_institute: e.target.value })}
                  placeholder="Company/Institute"
                />
                <Input
                  data-testid="exp-duration-input"
                  value={newExperience.duration}
                  onChange={(e) => setNewExperience({ ...newExperience, duration: e.target.value })}
                  placeholder="Duration (e.g., 2 years)"
                />
              </div>
              <Button data-testid="add-exp-btn" type="button" onClick={addExperience} variant="outline" className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </CardContent>
          </Card>

          {/* Subjects & Classes - Enhanced with Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Subjects You Can Teach
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Add subjects and select the class levels you can teach for each subject
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Subjects List */}
              {profileData.subjects?.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Your Subjects ({profileData.subjects.length})</h4>
                  {profileData.subjects?.map((subj, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg text-indigo-700">{subj.subject}</h4>
                          <p className="text-sm text-muted-foreground">{subj.classes?.length || 0} class level(s) selected</p>
                        </div>
                        <Button 
                          data-testid={`remove-subject-${idx}-btn`} 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeSubject(idx)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {subj.classes?.map((cls, i) => (
                          <Badge key={i} className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                            {cls}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add New Subject Section */}
              <div className="border-2 border-dashed border-indigo-200 rounded-lg p-6 bg-indigo-50/30">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Subject
                </h4>
                
                {/* Subject Selection */}
                <div className="space-y-4">
                  <div className="relative">
                    <Label className="text-sm font-medium">Subject Name *</Label>
                    <Input
                      data-testid="subject-search-input"
                      value={subjectSearch}
                      onChange={(e) => {
                        setSubjectSearch(e.target.value);
                        setNewSubject({ ...newSubject, subject: e.target.value });
                        setShowSubjectDropdown(true);
                      }}
                      onFocus={() => setShowSubjectDropdown(true)}
                      placeholder="Type to search or enter custom subject..."
                      className="mt-1"
                    />
                    {showSubjectDropdown && filteredSubjects.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredSubjects.map((subject, idx) => (
                          <button
                            key={idx}
                            data-testid={`subject-option-${idx}-btn`}
                            className="w-full px-4 py-2 text-left hover:bg-accent text-sm"
                            onClick={() => {
                              setNewSubject({ ...newSubject, subject });
                              setSubjectSearch(subject);
                              setShowSubjectDropdown(false);
                            }}
                          >
                            {subject}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Class Level Selection by Category */}
                  <div>
                    <Label className="text-sm font-medium">Select Class Levels You Can Teach *</Label>
                    <p className="text-xs text-muted-foreground mb-3">Click on levels to select/deselect</p>
                    
                    <div className="space-y-4">
                      {Object.entries(classCategories).map(([category, classes]) => (
                        <div key={category} className="border rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm text-gray-700">{category}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-xs h-6 px-2"
                              onClick={() => {
                                const allSelected = classes.every(cls => newSubject.classes?.includes(cls));
                                if (allSelected) {
                                  // Deselect all in this category
                                  setNewSubject({
                                    ...newSubject,
                                    classes: newSubject.classes?.filter(c => !classes.includes(c)) || []
                                  });
                                } else {
                                  // Select all in this category
                                  const currentClasses = newSubject.classes || [];
                                  const newClasses = [...new Set([...currentClasses, ...classes])];
                                  setNewSubject({ ...newSubject, classes: newClasses });
                                }
                              }}
                            >
                              {classes.every(cls => newSubject.classes?.includes(cls)) ? 'Deselect All' : 'Select All'}
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {classes.map((cls, idx) => (
                              <button
                                key={idx}
                                data-testid={`class-option-${cls}-btn`}
                                type="button"
                                onClick={() => toggleClass(cls)}
                                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                                  newSubject.classes?.includes(cls)
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                                }`}
                              >
                                {cls}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      {/* Special Categories for non-academic subjects */}
                      <div className="border rounded-lg p-3 bg-white">
                        <span className="font-medium text-sm text-gray-700 block mb-2">SPECIAL / NON-ACADEMIC</span>
                        <div className="flex flex-wrap gap-2">
                          {['Beginner', 'Intermediate', 'Advanced', 'Professional', 'All Ages', 'Kids (3-10)', 'Teens (11-17)', 'Adults (18+)'].map((cls, idx) => (
                            <button
                              key={idx}
                              data-testid={`special-class-${cls}-btn`}
                              type="button"
                              onClick={() => toggleClass(cls)}
                              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                                newSubject.classes?.includes(cls)
                                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:bg-orange-50'
                              }`}
                            >
                              {cls}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Selected Classes Preview */}
                  {newSubject.classes?.length > 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-2">
                        Selected for {newSubject.subject || 'this subject'}: {newSubject.classes.length} level(s)
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {newSubject.classes.map((cls, i) => (
                          <Badge key={i} className="bg-green-100 text-green-800">{cls}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <Button 
                  data-testid="add-subject-btn" 
                  type="button" 
                  onClick={addSubject} 
                  className="mt-4 rounded-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={!newSubject.subject || !newSubject.classes?.length}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle>Languages You Speak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profileData.languages?.map((lang, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                    {lang}
                    <button data-testid={`remove-lang-${idx}-btn`} onClick={() => removeLanguage(idx)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="relative">
                <div className="flex gap-2">
                  <Input
                    data-testid="add-language-input"
                    value={languageSearch}
                    onChange={(e) => {
                      setLanguageSearch(e.target.value);
                      setNewLanguage(e.target.value);
                      setShowLanguageDropdown(true);
                    }}
                    onFocus={() => setShowLanguageDropdown(true)}
                    placeholder="Type to search languages..."
                  />
                  <Button data-testid="add-language-btn" type="button" onClick={addLanguage} size="sm" className="rounded-full">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {showLanguageDropdown && filteredLanguages.length > 0 && languageSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredLanguages.map((lang, idx) => (
                      <button
                        key={idx}
                        data-testid={`language-option-${idx}-btn`}
                        className="w-full px-4 py-2 text-left hover:bg-accent"
                        onClick={() => {
                          setNewLanguage(lang);
                          setLanguageSearch(lang);
                          setShowLanguageDropdown(false);
                        }}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Tip: Start typing to see suggestions or enter a custom language name
              </p>
            </CardContent>
          </Card>

          {/* Fee Details */}
          <Card>
            <CardHeader>
              <CardTitle>Fee Details (per hour)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Fee (₹)</Label>
                  <Input
                    data-testid="fee-min-input"
                    type="number"
                    value={profileData.fee_min || ''}
                    onChange={(e) => setProfileData({ ...profileData, fee_min: parseInt(e.target.value) || 0 })}
                    placeholder="200"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Maximum Fee (₹)</Label>
                  <Input
                    data-testid="fee-max-input"
                    type="number"
                    value={profileData.fee_max || ''}
                    onChange={(e) => setProfileData({ ...profileData, fee_max: parseInt(e.target.value) || 0 })}
                    placeholder="1000"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teaching Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Teaching Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Can Travel to Student&apos;s Location</Label>
                  <p className="text-sm text-muted-foreground">Do you travel to teach at student&apos;s home?</p>
                </div>
                <Switch
                  data-testid="can-travel-switch"
                  checked={profileData.can_travel || false}
                  onCheckedChange={(checked) => setProfileData({ ...profileData, can_travel: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Teaches Online</Label>
                  <p className="text-sm text-muted-foreground">Do you offer online classes?</p>
                </div>
                <Switch
                  data-testid="teaches-online-switch"
                  checked={profileData.teaches_online || false}
                  onCheckedChange={(checked) => setProfileData({ ...profileData, teaches_online: checked })}
                />
              </div>
              
              {profileData.teaches_online && (
                <div>
                  <Label>Online Teaching Experience</Label>
                  <Input
                    data-testid="online-exp-input"
                    value={profileData.online_experience || ''}
                    onChange={(e) => setProfileData({ ...profileData, online_experience: e.target.value })}
                    placeholder="e.g., 2 years"
                    className="mt-1"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Teaches at Student&apos;s Home</Label>
                  <p className="text-sm text-muted-foreground">Home tuition at student&apos;s place</p>
                </div>
                <Switch
                  data-testid="teaches-at-home-switch"
                  checked={profileData.teaches_at_home || false}
                  onCheckedChange={(checked) => setProfileData({ ...profileData, teaches_at_home: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Homework Help</Label>
                  <p className="text-sm text-muted-foreground">Provide homework assistance</p>
                </div>
                <Switch
                  data-testid="homework-help-switch"
                  checked={profileData.homework_help || false}
                  onCheckedChange={(checked) => setProfileData({ ...profileData, homework_help: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Introduction Video */}
          <Card>
            <CardHeader>
              <CardTitle>Introduction Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-sm text-indigo-900 mb-4">
                  Students find teachers with intro videos more trustworthy. Intro videos are an opportunity to showcase your skills and stand out from the crowd.
                </p>
                <h4 className="font-semibold mb-2">Engaging intro videos include:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-indigo-800 mb-4">
                  <li>Your Name and location</li>
                  <li>Subjects and skills you teach</li>
                  <li>Languages you speak</li>
                  <li>Your qualifications and work experience</li>
                  <li>What students can expect in your lessons</li>
                  <li>Ending on a positive note</li>
                </ul>
                <h4 className="font-semibold mb-2">DO:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-indigo-800 mb-4">
                  <li>Record in Horizontal / Landscape mode</li>
                  <li>Room should be well lit with neutral background</li>
                  <li>Clear audio with no background noise</li>
                  <li>Maximum 3 minutes long</li>
                </ul>
                <h4 className="font-semibold mb-2">DO NOT:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-indigo-800">
                  <li>Mention your contact details</li>
                  <li>Use frames/borders or filters</li>
                  <li>Show other people in the video</li>
                  <li>Use slideshows or presentations</li>
                </ul>
              </div>
              <div>
                <Label>YouTube Video URL</Label>
                <Input
                  data-testid="intro-video-input"
                  value={profileData.intro_video_url || ''}
                  onChange={(e) => setProfileData({ ...profileData, intro_video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button data-testid="cancel-btn" variant="outline" onClick={() => navigate('/tutor/dashboard')} className="rounded-full">
              Cancel
            </Button>
            <Button data-testid="save-final-btn" onClick={handleSaveProfile} disabled={loading} className="bg-primary hover:bg-primary/90 rounded-full px-8">
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
