import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, BookOpen, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { API, setAuthToken } from '@/utils/api';
import axios from 'axios';

export default function AuthPage({ setUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('tutor');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  
  // Login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Signup form
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // OTP verification
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      setAuthToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      toast.success('Login successful!');
      
      if (response.data.user.role === 'tutor') {
        navigate('/tutor/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/signup`, {
        email: signupData.email,
        password: signupData.password,
        role: selectedRole,
        name: signupData.name
      });
      
      setAuthToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setRegisteredEmail(signupData.email);
      toast.success('Account created! Please verify your email.');
      setShowOTPVerification(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const sendEmailOTP = async () => {
    try {
      const response = await axios.post(`${API}/auth/send-otp?email=${registeredEmail}&otp_type=email`);
      if (response.data.mode === 'mock') {
        toast.success(`OTP sent! For testing use: ${response.data.otp}`);
      } else {
        toast.success('OTP sent to your email!');
      }
    } catch (error) {
      toast.error('Failed to send OTP');
    }
  };

  const verifyOTP = async () => {
    try {
      await axios.post(`${API}/auth/verify-otp`, {
        email: registeredEmail,
        otp: otp,
        otp_type: 'email'
      });
      toast.success('Email verified successfully!');
      
      if (selectedRole === 'tutor') {
        navigate('/tutor/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      toast.error('Invalid OTP. Try 123456 for testing.');
    }
  };

  const skipVerification = () => {
    if (selectedRole === 'tutor') {
      navigate('/tutor/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  if (showOTPVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold">Verify Your Email</CardTitle>
            <CardDescription className="text-base mt-2">
              We sent a verification code to<br />
              <span className="font-medium text-gray-900">{registeredEmail}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>For Testing:</strong> Use OTP <code className="bg-amber-100 px-2 py-0.5 rounded font-mono">123456</code>
              </p>
            </div>

            <div>
              <Label htmlFor="otp">Enter 6-digit OTP</Label>
              <Input
                data-testid="otp-input"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="mt-2 text-center text-2xl tracking-widest font-mono h-14"
                maxLength={6}
              />
            </div>

            <div className="space-y-3">
              <Button
                data-testid="send-otp-btn"
                onClick={sendEmailOTP}
                variant="outline"
                className="w-full rounded-full h-11"
              >
                Send OTP to Email
              </Button>
              <Button
                data-testid="verify-otp-btn"
                onClick={verifyOTP}
                className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-full h-11 font-semibold"
                disabled={otp.length !== 6}
              >
                Verify & Continue
              </Button>
              <Button
                variant="ghost"
                onClick={skipVerification}
                className="w-full text-gray-500 hover:text-gray-700"
              >
                Skip for now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Card className="w-full max-w-lg shadow-xl border-0">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-semibold text-gray-900">
            {authMode === 'login' ? 'Welcome back' : 'Create account'}
          </CardTitle>
          <CardDescription className="text-base text-gray-500">
            {authMode === 'login' 
              ? 'Sign in to continue to your account' 
              : 'Join Tricity Tutors today'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedRole('tutor')}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                selectedRole === 'tutor'
                  ? 'border-indigo-600 bg-indigo-50/50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <GraduationCap className={`w-8 h-8 ${
                  selectedRole === 'tutor' ? 'text-indigo-600' : 'text-gray-400'
                }`} />
                <span className={`font-semibold ${
                  selectedRole === 'tutor' ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  Tutor
                </span>
                <span className="text-xs text-gray-500">I want to teach students</span>
              </div>
              {selectedRole === 'tutor' && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 ${
                selectedRole === 'student'
                  ? 'border-orange-500 bg-orange-50/50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <BookOpen className={`w-8 h-8 ${
                  selectedRole === 'student' ? 'text-orange-500' : 'text-gray-400'
                }`} />
                <span className={`font-semibold ${
                  selectedRole === 'student' ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  Student
                </span>
                <span className="text-xs text-gray-500">I want to find tutors</span>
              </div>
              {selectedRole === 'student' && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Auth Mode Tabs */}
          <Tabs value={authMode} onValueChange={setAuthMode} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-gray-100 rounded-full">
              <TabsTrigger 
                value="login" 
                className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    data-testid="login-email-input"
                    id="login-email"
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="your@email.com"
                    required
                    className="mt-2 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="login-password" className="text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      data-testid="login-password-input"
                      id="login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="••••••••"
                      required
                      className="h-12 bg-gray-50 border-gray-200 focus:bg-white pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  data-testid="login-submit-btn"
                  type="submit"
                  className={`w-full h-12 rounded-full font-semibold text-base ${
                    selectedRole === 'tutor' 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            {/* Signup Form */}
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name" className="text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    data-testid="signup-name-input"
                    id="signup-name"
                    name="name"
                    type="text"
                    value={signupData.name}
                    onChange={handleSignupChange}
                    placeholder="Enter your full name"
                    required
                    className="mt-2 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="signup-email" className="text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    data-testid="signup-email-input"
                    id="signup-email"
                    name="email"
                    type="email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    placeholder="your@email.com"
                    required
                    className="mt-2 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="signup-password" className="text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      data-testid="signup-password-input"
                      id="signup-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={signupData.password}
                      onChange={handleSignupChange}
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                      className="h-12 bg-gray-50 border-gray-200 focus:bg-white pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="signup-confirm-password" className="text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    data-testid="signup-confirm-password-input"
                    id="signup-confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    placeholder="Confirm your password"
                    required
                    className="mt-2 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                  />
                  {signupData.confirmPassword && signupData.password !== signupData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <Button
                  data-testid="signup-submit-btn"
                  type="submit"
                  className={`w-full h-12 rounded-full font-semibold text-base ${
                    selectedRole === 'tutor' 
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                  disabled={loading || (signupData.confirmPassword && signupData.password !== signupData.confirmPassword)}
                >
                  {loading ? 'Creating account...' : `Sign Up as ${selectedRole === 'tutor' ? 'Tutor' : 'Student'}`}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
