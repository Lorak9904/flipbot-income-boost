
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const FacebookCallbackPage = () => {
  const { loginWithProvider } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const error = urlParams.get("error");

        if (error) {
          throw new Error(`Facebook login failed: ${error}`);
        }

        if (!code) {
          throw new Error("No authorization code received from Facebook");
        }

        // Exchange code for token - in a real app, this should be done server-side
        // For demo purposes, we'll simulate the token exchange
        const appId = "YOUR_FACEBOOK_APP_ID"; // Replace in production
        const redirectUri = encodeURIComponent("http://localhost:3000/facebook-callback");
        const appSecret = "YOUR_FACEBOOK_APP_SECRET"; // Replace in production
        
        const tokenResponse = await fetch(
          `https://graph.facebook.com/v13.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`
        );
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.error) {
          throw new Error(`Token exchange failed: ${tokenData.error.message}`);
        }

        await loginWithProvider("facebook", tokenData.access_token);
        
        toast({
          title: "Successfully logged in with Facebook",
          description: "Welcome to FlipIt!",
        });
        
        navigate("/");
      } catch (error: any) {
        console.error("Facebook login error:", error);
        toast({
          title: "Login Failed",
          description: error.message || "Unable to login with Facebook",
          variant: "destructive",
        });
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [loginWithProvider, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="text-center text-white">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Logging in with Facebook</h2>
        <p className="text-slate-300">Please wait while we complete the process...</p>
      </div>
    </div>
  );
};

export default FacebookCallbackPage;
