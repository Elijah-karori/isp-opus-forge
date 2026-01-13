import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Building2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { checkRateLimit, recordAttempt, formatRemainingTime } from '@/lib/rate-limiter';
import { getSafeErrorMessage, otpSchema } from '@/lib/validation';

const registerSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(254, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
  full_name: z.string().trim().min(2, 'Full name is required').max(100, 'Name too long')
    .refine(val => !val.includes('<') && !val.includes('>'), 'Invalid characters'),
  company_name: z.string().max(100, 'Company name too long').optional(),
});

type RegisterData = z.infer<typeof registerSchema>;

type Step = 'register' | 'otp' | 'success';

// Rate limit keys
const RATE_LIMIT_REGISTER = 'register';
const RATE_LIMIT_OTP = 'register-otp';
const RATE_LIMIT_RESEND = 'resend-otp';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>('register');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    full_name: '',
    company_name: '',
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData, string>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Check rate limit
    const rateLimit = checkRateLimit(RATE_LIMIT_REGISTER);
    if (rateLimit.isLimited) {
      toast({
        title: 'Too Many Attempts',
        description: `Please wait ${formatRemainingTime(rateLimit.remainingMs)} before trying again.`,
        variant: 'destructive',
      });
      return;
    }

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof RegisterData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.register({
        email: result.data.email,
        password: result.data.password,
        full_name: result.data.full_name,
        company_name: result.data.company_name || undefined,
      });
      
      recordAttempt(RATE_LIMIT_REGISTER, true);
      toast({
        title: 'Registration successful',
        description: 'Please check your email for the OTP verification code.',
      });
      setStep('otp');
    } catch (error: unknown) {
      recordAttempt(RATE_LIMIT_REGISTER, false);
      toast({
        title: 'Registration failed',
        description: getSafeErrorMessage(error, 'An error occurred during registration.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit
    const rateLimit = checkRateLimit(RATE_LIMIT_OTP);
    if (rateLimit.isLimited) {
      toast({
        title: 'Too Many Attempts',
        description: `Please wait ${formatRemainingTime(rateLimit.remainingMs)} before trying again.`,
        variant: 'destructive',
      });
      return;
    }

    // Validate OTP
    const otpValidation = otpSchema.safeParse(otp);
    if (!otpValidation.success) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter the 6-digit code sent to your email.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/verify-otp', {
        email: formData.email,
        otp: otpValidation.data,
      });
      
      recordAttempt(RATE_LIMIT_OTP, true);
      toast({
        title: 'Email verified!',
        description: 'Your account has been verified successfully.',
      });
      setStep('success');
    } catch (error: unknown) {
      recordAttempt(RATE_LIMIT_OTP, false);
      const rateStatus = checkRateLimit(RATE_LIMIT_OTP);
      toast({
        title: 'Verification failed',
        description: rateStatus.attemptsLeft > 0
          ? `${getSafeErrorMessage(error, 'Invalid or expired OTP')}. ${rateStatus.attemptsLeft} attempts remaining.`
          : getSafeErrorMessage(error, 'Invalid or expired OTP. Please try again.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    // Check rate limit
    const rateLimit = checkRateLimit(RATE_LIMIT_RESEND);
    if (rateLimit.isLimited) {
      toast({
        title: 'Too Many Attempts',
        description: `Please wait ${formatRemainingTime(rateLimit.remainingMs)} before trying again.`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/resend-otp', { email: formData.email });
      recordAttempt(RATE_LIMIT_RESEND, true);
      toast({
        title: 'OTP Resent',
        description: 'A new verification code has been sent to your email.',
      });
    } catch (error: unknown) {
      recordAttempt(RATE_LIMIT_RESEND, false);
      toast({
        title: 'Failed to resend OTP',
        description: getSafeErrorMessage(error, 'Please try again later.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Registration Form
  if (step === 'register') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
        <Card className="w-full max-w-md border-border/50 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
            <CardDescription>Enter your details to get started</CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="pl-10"
                    disabled={isLoading}
                    maxLength={100}
                  />
                </div>
                {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    disabled={isLoading}
                    maxLength={254}
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10"
                    disabled={isLoading}
                    maxLength={128}
                  />
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name (Optional)</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company_name"
                    name="company_name"
                    placeholder="Acme Inc."
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="pl-10"
                    disabled={isLoading}
                    maxLength={100}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // OTP Verification
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
        <Card className="w-full max-w-md border-border/50 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Verify your email</CardTitle>
            <CardDescription>
              We sent a 6-digit code to <span className="font-medium text-foreground">{formData.email}</span>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleVerifyOtp}>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-primary hover:underline font-medium"
                  disabled={isLoading}
                >
                  Resend
                </button>
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('register')}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to registration
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // Success
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/30">
      <Card className="w-full max-w-md border-border/50 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Account verified!</CardTitle>
          <CardDescription>
            Your email has been verified successfully. You can now sign in to your account.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full" onClick={() => navigate('/login')}>
            Continue to Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
