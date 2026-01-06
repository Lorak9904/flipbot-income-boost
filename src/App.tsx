import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { HelmetProvider } from "react-helmet-async";


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
import PricingPage from "./pages/PricingPage";
import ConnectAccountsPage from "./pages/ConnectAccountsPage";
import AddItemPage from "./pages/AddItemPage";
import UserItemsPage from "./pages/UserItemsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import NotFound from "./pages/NotFound";
import AutomatedResellingPlatformGuide from "./pages/AutomatedResellingPlatformGuide";
// import FacebookCallbackPage from "./pages/FacebookCallbackPage";
import TermsPage from "./pages/Terms";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import CookiesPolicyPage from "./pages/CookiesPolicy"
import CookieBanner from "./components/CookieBanner";
import ScrollToTop from "./components/ScrollToTop";
import SettingsPage from "./pages/SettingsPage";
import PlatformSettingsPage from "./pages/PlatformSettingsPage";
import VisitorPing from "./components/useVisitorPing"; // This should resolve to useVisitorPing.tsx
import { ConnectOlxButton } from "./pages/ConnectOlxButton";
import { OlxSuccessPage } from "./pages/OlxSuccessPage";
import ButtonShowcase from "./pages/ButtonShowcase";



const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
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
                  <Route path="/automated-reselling-platform-guide" element={<AutomatedResellingPlatformGuide />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/success-stories" element={<SuccessStoriesPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  {/* <Route path="/features" element={<FeaturesPage />} /> */}
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/get-started" element={<GetStartedPage />} />
                  <Route path="/connect-accounts" element={<ConnectAccountsPage />} />
                  <Route path="/add-item" element={<AddItemPage />} />
                  <Route path="/user/items" element={<UserItemsPage />} />
                  <Route path="/user/items/:uuid" element={<ItemDetailPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/cookies" element={<CookiesPolicyPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/platform-settings/:platform" element={<PlatformSettingsPage />} />
                  {/* <Route path="/olx/success" element={<OlxSuccessPage />} /> */}
                  
                  {/* Dev/Reference Pages (not linked in navigation) */}
                  <Route path="/dev/buttons" element={<ButtonShowcase />} />
                  
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
    </HelmetProvider>
    </QueryClientProvider>
  );
};
export default App;



