
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // Replace with real client ID
const FACEBOOK_APP_ID = "YOUR_APP_ID"; // Replace with real app ID

const LoginPage = () => {
  const { loginWithProvider, loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    
    setIsLoading(true);

    try {
      await registerWithEmail(email, password, name);
      toast({
        title: "Registered successfully",
        description: "Welcome to FlipIt!",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Unable to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await loginWithProvider("google", credentialResponse.credential);
      toast({
        title: "Logged in with Google",
        description: "Welcome to FlipIt!",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Unable to login with Google",
        variant: "destructive",
      });
    }
  };

  const handleFacebookLogin = async () => {
    try {
      // Redirect to Facebook OAuth
      const appId = FACEBOOK_APP_ID; // Replace with your Facebook App ID
      const redirectUri = encodeURIComponent("http://localhost:3000/facebook-callback");
      const facebookLoginUrl = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=email,public_profile`;

      window.location.href = facebookLoginUrl;
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Unable to login with Facebook",
        variant: "destructive",
      });
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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-800 px-2 text-slate-400">or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Google Login */}
              <div className="flex justify-center">
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                      toast({
                        title: "Login Failed",
                        description: "Google login failed. Please try again.",
                        variant: "destructive",
                      });
                    }}
                    theme="filled_black"
                    size="large"
                    shape="pill"
                    text={isSignUp ? "signup_with" : "signin_with"}
                    width="270px"
                  />
                </GoogleOAuthProvider>
              </div>

              {/* Facebook Login */}
              <Button
                variant="outline"
                className="w-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-white border-white/10"
                onClick={handleFacebookLogin}
              >
                <Facebook className="mr-2 h-4 w-4 text-[#1877F2]" />
                {isSignUp ? 'Sign Up' : 'Log In'} with Facebook
              </Button>
            </div>
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
