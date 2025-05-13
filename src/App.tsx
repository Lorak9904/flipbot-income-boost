
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
import FacebookCallbackPage from "./pages/FacebookCallbackPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/success-stories" element={<SuccessStoriesPage />} />
                <Route path="/features" element={<FeaturesPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/get-started" element={<GetStartedPage />} />
                <Route path="/connect-accounts" element={<ConnectAccountsPage />} />
                <Route path="/add-item" element={<AddItemPage />} />
                <Route path="/facebook-callback" element={<FacebookCallbackPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <WaitlistBadge />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
