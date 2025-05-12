import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const FacebookCallbackPage = () => {
  const { loginWithProvider } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      fetch(`https://graph.facebook.com/v13.0/oauth/access_token?client_id=YOUR_FACEBOOK_APP_ID&redirect_uri=http://localhost:3000/facebook-callback&client_secret=YOUR_FACEBOOK_APP_SECRET&code=${code}`)
        .then((res) => res.json())
        .then(async (data) => {
          if (data.access_token) {
            await loginWithProvider("facebook", data.access_token);
            toast({
              title: "Logged in with Facebook",
              description: "Welcome to FlipIt!",
            });
            navigate("/");
          } else {
            throw new Error("Failed to retrieve access token");
          }
        })
        .catch((error) => {
          console.error("Facebook login failed:", error);
          toast({
            title: "Login Failed",
            description: "Unable to login with Facebook",
            variant: "destructive",
          });
        });
    }
  }, [loginWithProvider, navigate, toast]);

  return <div>Logging in...</div>;
};

export default FacebookCallbackPage;