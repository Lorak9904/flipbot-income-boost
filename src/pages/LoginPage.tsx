import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';


// Common password list (short, for demo; expand as needed)
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', '111111', '123456789', '12345', '123123', '000000',
];

function validatePassword(password: string, name: string, email: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  if (name && password.toLowerCase().includes(name.toLowerCase())) {
    errors.push('Password is too similar to your name.');
  }
  if (email) {
    const emailPart = email.split('@')[0];
    if (password.toLowerCase().includes(emailPart.toLowerCase())) {
      errors.push('Password is too similar to your email address.');
    }
  }
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Password is too common.');
  }
  if (/^\d+$/.test(password)) {
    errors.push('Password cannot be entirely numeric.');
  }
  return errors;
}

const LoginPage = () => {
  const { loginWithProvider, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await loginWithEmail(email, password);
      toast({
        title: "Logged in successfully",
        description: "Welcome to FlipIt!",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Unable to log in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Registration Failed",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    const errors = validatePassword(password, name, email);
    setPasswordErrors(errors);
    if (errors.length > 0) {
      toast({
        title: "Password does not meet requirements",
        description: errors.join(' '),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await registerWithEmail(email, password, name);
      toast({
        title: "Registered successfully",
        description: "Please log in to continue.",
      });
    // Reset form and switch to login
      setIsSignUp(false);
      setPassword('');
      setPasswordErrors([]);
    } 
    catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Unable to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 py-12">
      <div className="w-full max-w-md px-4">
        <Card className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-green-400 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
              FI
            </div>
            <CardTitle className="text-3xl text-white mb-2">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </CardTitle>
            <CardDescription className="text-slate-300">
              {isSignUp
                ? 'Sign up to start flipping items for profit'
                : 'Log in to access your FlipIt dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* Email/Password Form */}
            <form onSubmit={isSignUp ? handleRegister : handleEmailLogin} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignUp}
                    className="bg-white/10 border-white/10 text-white placeholder:text-slate-400"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/10 text-white placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/10 border-white/10 text-white placeholder:text-slate-400"
                />
              </div>
              {isSignUp && passwordErrors.length > 0 && (
                <div className="text-red-500 text-sm space-y-1">
                  {passwordErrors.map((err, idx) => (
                    <div key={idx}>{err}</div>
                  ))}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-600"
                variant="default"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? 'Signing Up...' : 'Logging In...'}
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    {isSignUp ? 'Sign Up' : 'Log In'} with Email
                  </>
                )}
              </Button>
            </form>

          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              variant="link"
              className="text-slate-300 hover:text-white"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? 'Already have an account? Log in'
                : "Don't have an account? Sign up"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
