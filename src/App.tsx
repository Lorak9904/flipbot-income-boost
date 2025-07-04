import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";


import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WaitlistBadge from "./components/WaitlistBadge";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import SuccessStoriesPage from "./pages/SuccessStoriesPage";
import FeaturesPage from "./pages/FeaturesPage";
import FAQPage from "./pages/FAQPage";
import GetStartedPage from "./pages/GetStartedPage";
import ConnectAccountsPage from "./pages/ConnectAccountsPage";
import AddItemPage from "./pages/AddItemPage";
import NotFound from "./pages/NotFound";
// import FacebookCallbackPage from "./pages/FacebookCallbackPage";
import TermsPage from "./pages/Terms";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import CookiesPolicyPage from "./pages/CookiesPolicy"
import CookieBanner from "./components/CookieBanner";
import ScrollToTop from "./components/ScrollToTop";
import SettingsPage from "./pages/SettingsPage";
import VisitorPing from "./components/useVisitorPing"; // This should resolve to useVisitorPing.tsx
import { ConnectOlxButton } from "./pages/ConnectOlxButton";
import { OlxSuccessPage } from "./pages/OlxSuccessPage";



const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/">
            <ScrollToTop />
            <VisitorPing />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  {/* <Route path="/success-stories" element={<SuccessStoriesPage />} /> */}
                  {/* <Route path="/features" element={<FeaturesPage />} /> */}
                  {/* <Route path="/faq" element={<FAQPage />} /> */}
                  <Route path="/get-started" element={<GetStartedPage />} />
                  <Route path="/connect-accounts" element={<ConnectAccountsPage />} />
                  <Route path="/add-item" element={<AddItemPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/cookies" element={<CookiesPolicyPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  {/* <Route path="/olx/success" element={<OlxSuccessPage />} /> */}
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <CookieBanner />
              {/* <WaitlistBadge /> */}
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
export default App;
