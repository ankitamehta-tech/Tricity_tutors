import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { API, setAuthToken } from '@/utils/api';
import axios from 'axios';

export default function TutorSignup({ setUser }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    role: 'tutor'
  });
  const [otp, setOtp] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/signup`, formData);
      setAuthToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      toast.success('Signup successful!');
      setStep(2);
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
      navigate('/tutor/dashboard');
    } catch (error) {
      toast.error('Invalid OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="w-12 h-12 text-indigo-600" />
          </div>
          <CardTitle className="text-3xl font-outfit text-center">Become a Tutor</CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? 'Create your tutor account' : 'Verify your details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  data-testid="name-input"
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
                  data-testid="email-input"
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
                <Label htmlFor="mobile">Mobile Number (Optional)</Label>
                <Input
                  data-testid="mobile-input"
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
                  maxLength={10}
                  pattern="[0-9]{10}"
                  className="mt-1"
                />
                {formData.mobile && formData.mobile.length !== 10 && formData.mobile.length > 0 && (
                  <p className="text-xs text-red-500 mt-1">Mobile number must be exactly 10 digits</p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  data-testid="password-input"
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
                data-testid="signup-submit-btn"
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 rounded-full h-11 font-semibold"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          ) : (
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
                  data-testid="otp-input"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <Button
                  data-testid="send-email-otp-btn"
                  onClick={() => sendOTP('email')}
                  variant="outline"
                  className="w-full rounded-full"
                >
                  Send Email OTP
                </Button>
                <Button
                  data-testid="verify-email-btn"
                  onClick={() => verifyOTP()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-full"
                >
                  Verify Email & Continue
                </Button>
              </div>
            </div>
          )}
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
