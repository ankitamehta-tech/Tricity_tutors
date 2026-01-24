import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { API, setAuthToken } from '@/utils/api';
import axios from 'axios';

export default function StudentSignup({ setUser }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    role: 'student',
    company_name: '',
    institute_name: ''
  });
  const [otp, setOtp] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value) => {
    setFormData({ ...formData, role: value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/signup`, formData);
      setAuthToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      toast.success('Signup successful!');
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (type) => {
    try {
      await axios.post(`${API}/auth/send-otp?email=${formData.email}&otp_type=${type}`);
      toast.success(`OTP sent to your ${type}`);
    } catch (error) {
      toast.error('Failed to send OTP');
    }
  };

  const verifyOTP = async () => {
    try {
      await axios.post(`${API}/auth/verify-otp`, {
        email: formData.email,
        otp: otp,
        otp_type: 'email'
      });
      toast.success('Email verified successfully!');
      navigate('/student/dashboard');
    } catch (error) {
      toast.error('Invalid OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-orange-50 via-white to-indigo-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="w-12 h-12 text-orange-500" />
          </div>
          <CardTitle className="text-3xl font-outfit text-center">Find Your Tutor</CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? 'Create your account' : step === 2 ? 'Tell us about yourself' : 'Verify your details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  data-testid="student-name-input"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  data-testid="student-email-input"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  data-testid="student-password-input"
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <Button
                data-testid="student-next-btn"
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 rounded-full h-11 font-semibold"
              >
                Next
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="role">I am a</Label>
                <Select onValueChange={handleRoleChange} defaultValue="student">
                  <SelectTrigger data-testid="role-select" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="coaching">Coaching Institute</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === 'company' && (
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    data-testid="company-name-input"
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
              )}

              {formData.role === 'coaching' && (
                <div>
                  <Label htmlFor="institute_name">Institute Name</Label>
                  <Input
                    data-testid="institute-name-input"
                    id="institute_name"
                    name="institute_name"
                    value={formData.institute_name}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  data-testid="student-mobile-input"
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 10) {
                      setFormData({ ...formData, mobile: value });
                    }
                  }}
                  placeholder="10-digit mobile number"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="mt-1"
                />
                {formData.mobile && formData.mobile.length !== 10 && (
                  <p className="text-xs text-red-500 mt-1">Mobile number must be exactly 10 digits</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  data-testid="back-btn"
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 rounded-full"
                >
                  Back
                </Button>
                <Button
                  data-testid="student-signup-submit-btn"
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 rounded-full font-semibold"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Sign Up'}
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Verify your email to continue.</strong><br/>
                  Click "Send Email OTP" and check your inbox.
                </p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>For Testing:</strong> Use OTP <code className="bg-amber-100 px-1 rounded">123456</code>
                </p>
              </div>
              <div>
                <Label htmlFor="otp">Enter Email OTP</Label>
                <Input
                  data-testid="student-otp-input"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <Button
                  data-testid="student-send-email-otp-btn"
                  onClick={() => sendOTP('email')}
                  variant="outline"
                  className="w-full rounded-full"
                >
                  Send Email OTP
                </Button>
                <Button
                  data-testid="student-verify-email-btn"
                  onClick={() => verifyOTP()}
                  className="w-full bg-orange-500 hover:bg-orange-600 rounded-full"
                >
                  Verify Email & Continue
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-500 font-semibold hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
