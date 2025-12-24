// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Wifi,
  Send,
  ChevronRight,
  Fingerprint
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';

// SVG Icons for OAuth
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

type LoginView = 'main' | 'magic-link' | 'otp-verify';

const Login = () => {
  const [view, setView] = useState<LoginView>('main');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'employee',
  });
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.username, formData.password);
      toast({
        title: "Login Successful",
        description: "Welcome to ISP Connect ERP",
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkRequest = async () => {
    if (!magicLinkEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSendingMagicLink(true);
    try {
      await apiClient.request({
        url: '/auth/passwordless/request',
        method: 'POST',
        params: { email: magicLinkEmail }
      });
      toast({
        title: "Magic Link Sent!",
        description: "Check your email for the login link",
      });
      setView('otp-verify');
    } catch (error: any) {
      toast({
        title: "Failed to Send",
        description: error.message || "Could not send magic link",
        variant: "destructive",
      });
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    toast({
      title: "OAuth Coming Soon",
      description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} login requires backend configuration`,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Main Login View
  if (view === 'main') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Header */}
        <div className="flex-none p-6 pt-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Wifi className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ISP Connect</h1>
              <p className="text-blue-200 text-sm">Enterprise Resource Planning</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-6 pb-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-blue-200">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selector */}
            <div className="space-y-2">
              <Label className="text-blue-100">Login As</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleChange('role', value)}
              >
                <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white placeholder:text-blue-200">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="finance">Finance Manager</SelectItem>
                  <SelectItem value="hr">HR Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Username/Email */}
            <div className="space-y-2">
              <Label className="text-blue-100">Username or Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Enter your username or email"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  className="h-12 pl-12 bg-white/10 border-white/20 text-white placeholder:text-blue-300"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-blue-100">Password</Label>
                <Link
                  to="#"
                  onClick={() => setView('magic-link')}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="h-12 pl-12 pr-12 bg-white/10 border-white/20 text-white placeholder:text-blue-300"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-4 text-blue-300 hover:text-white hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg shadow-lg shadow-blue-500/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ChevronRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-transparent px-4 text-sm text-blue-300">or continue with</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 bg-white hover:bg-gray-100 text-gray-800 border-0"
                onClick={() => handleOAuthLogin('google')}
              >
                <GoogleIcon />
                <span className="ml-2 font-medium">Google</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 bg-gray-800 hover:bg-gray-700 text-white border-0"
                onClick={() => handleOAuthLogin('github')}
              >
                <GitHubIcon />
                <span className="ml-2 font-medium">GitHub</span>
              </Button>
            </div>

            {/* Magic Link */}
            <Button
              type="button"
              variant="ghost"
              className="w-full h-12 text-blue-300 hover:text-white hover:bg-white/10"
              onClick={() => setView('magic-link')}
            >
              <Send className="h-4 w-4 mr-2" />
              Sign in with Magic Link
            </Button>

            {/* Face ID */}
            <Button
              type="button"
              variant="ghost"
              className="w-full h-12 text-blue-300 hover:text-white hover:bg-white/10"
              onClick={() => toast({ title: "Face ID", description: "Biometric login not yet available" })}
            >
              <Fingerprint className="h-5 w-5 mr-2" />
              Sign in with Face ID
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex-none p-6 text-center">
          <p className="text-blue-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-white font-medium hover:underline">
              Contact Admin
            </Link>
          </p>
          <p className="text-blue-500 text-xs mt-4">v2.1.0</p>
        </div>
      </div>
    );
  }

  // Magic Link View
  if (view === 'magic-link') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-6">
        <div className="pt-12 pb-8">
          <Button
            variant="ghost"
            className="text-blue-300 hover:text-white -ml-4"
            onClick={() => setView('main')}
          >
            ← Back to login
          </Button>
        </div>

        <div className="flex-1 flex flex-col justify-center pb-20">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/30">
            <Send className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Passwordless Login</h2>
          <p className="text-blue-200 mb-8">Enter your email and we'll send you a magic link</p>

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
              <Input
                type="email"
                placeholder="Enter your email address"
                value={magicLinkEmail}
                onChange={(e) => setMagicLinkEmail(e.target.value)}
                className="h-14 pl-12 bg-white/10 border-white/20 text-white placeholder:text-blue-300 text-lg"
              />
            </div>

            <Button
              onClick={handleMagicLinkRequest}
              className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg shadow-lg shadow-blue-500/30"
              disabled={isSendingMagicLink}
            >
              {isSendingMagicLink ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  Send Magic Link
                  <ChevronRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verify View
  if (view === 'otp-verify') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-6">
        <div className="pt-12 pb-8">
          <Button
            variant="ghost"
            className="text-blue-300 hover:text-white -ml-4"
            onClick={() => setView('magic-link')}
          >
            ← Back
          </Button>
        </div>

        <div className="flex-1 flex flex-col justify-center pb-20">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-green-500/30">
            <Mail className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Check Your Email</h2>
          <p className="text-blue-200 mb-8">
            We sent a verification code to <br />
            <span className="text-white font-medium">{magicLinkEmail}</span>
          </p>

          <div className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpValue}
                onChange={setOtpValue}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12 h-14 bg-white/10 border-white/20 text-white text-xl" />
                  <InputOTPSlot index={1} className="w-12 h-14 bg-white/10 border-white/20 text-white text-xl" />
                  <InputOTPSlot index={2} className="w-12 h-14 bg-white/10 border-white/20 text-white text-xl" />
                  <InputOTPSlot index={3} className="w-12 h-14 bg-white/10 border-white/20 text-white text-xl" />
                  <InputOTPSlot index={4} className="w-12 h-14 bg-white/10 border-white/20 text-white text-xl" />
                  <InputOTPSlot index={5} className="w-12 h-14 bg-white/10 border-white/20 text-white text-xl" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={() => {
                toast({
                  title: "Verification",
                  description: "OTP verification requires clicking the magic link from your email",
                });
              }}
              className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg shadow-lg shadow-blue-500/30"
              disabled={otpValue.length < 6}
            >
              Verify & Sign In
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>

            <div className="text-center">
              <Button
                variant="ghost"
                className="text-blue-300 hover:text-white"
                onClick={handleMagicLinkRequest}
              >
                Resend Code
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Login;
