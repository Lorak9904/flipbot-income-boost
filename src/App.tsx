import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route, useLocation } from "react-router-dom";
import type { ReactElement } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { HelmetProvider } from "react-helmet-async";


import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WaitlistBadge from "./components/WaitlistBadge";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import SuccessStoriesPage from "./pages/SuccessStoriesPage";
import FeaturesPage from "./pages/FeaturesPage";
import FAQPage from "./pages/FAQPage";
import GetStartedPage from "./pages/GetStartedPage";
import PricingPage from "./pages/PricingPage";
import ConnectAccountsPage from "./pages/ConnectAccountsPage";
import AddItemPage from "./pages/AddItemPage";
import EditItemPage from "./pages/EditItemPage";
import UserItemsPage from "./pages/UserItemsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import UserStatisticsPage from "./pages/UserStatisticsPage";
import NotFound from "./pages/NotFound";
import AutomatedResellingPlatformGuide from "./pages/AutomatedResellingPlatformGuide";
import ArticlesIndex from "./pages/articles/ArticlesIndex";
import PriceCheckerPage from "./pages/PriceCheckerPage";
import VintedRelistingToolArticle from "./pages/articles/VintedRelistingToolArticle";
import CrossListVintedToFacebookMarketplaceArticle from "./pages/articles/CrossListVintedToFacebookMarketplaceArticle";
import ProductRelisterForVintedArticle from "./pages/articles/ProductRelisterForVintedArticle";
import SellOnAllegroArticle from "./pages/articles/SellOnAllegroArticle";
import HowToPriceItemsForEbayArticle from "./pages/articles/HowToPriceItemsForEbayArticle";
import EbayActiveListingsVsSoldPricesArticle from "./pages/articles/EbayActiveListingsVsSoldPricesArticle";
import HowMuchIsMyUsedItemWorthArticle from "./pages/articles/HowMuchIsMyUsedItemWorthArticle";
import OlxCountryAccountsArticle from "./pages/articles/OlxCountryAccountsArticle";
import EtsyListingToolArticle from "./pages/articles/EtsyListingToolArticle";
// import FacebookCallbackPage from "./pages/FacebookCallbackPage";
import TermsPage from "./pages/Terms";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import CookiesPolicyPage from "./pages/CookiesPolicy"
import CookieBanner from "./components/CookieBanner";
import TawkChat from "./components/TawkChat";
import { FirstListingCoach } from "./components/onboarding/FirstListingCoach";
import ScrollToTop from "./components/ScrollToTop";
import SettingsPage from "./pages/SettingsPage";
import PlatformSettingsPage from "./pages/PlatformSettingsPage";
import VisitorPing from "./components/useVisitorPing"; // This should resolve to useVisitorPing.tsx
import SessionHealthCheck from "./components/SessionHealthCheck";
import PostHogUserSync from "./components/PostHogUserSync";
import { ConnectOlxButton } from "./pages/ConnectOlxButton";
import { OlxSuccessPage } from "./pages/OlxSuccessPage";
import ButtonShowcase from "./pages/ButtonShowcase";
import RequireAuth from "./components/RequireAuth";
import {
  getLocalizedRoutePaths,
  getRoutePath,
  legacyLocalizedRoutes,
  type LocalizedRouteKey,
} from "./lib/localized-routes";



const queryClient = new QueryClient();

const localizedRouteElements = (key: LocalizedRouteKey, element: ReactElement) =>
  getLocalizedRoutePaths(key).map((path) => (
    <Route key={path} path={path} element={element} />
  ));

const LegacyLocalizedRedirect = ({ routeKey }: { routeKey: LocalizedRouteKey }) => {
  const location = useLocation();
  const target = getRoutePath(routeKey, 'pl');
  return <Navigate to={`${target}${location.search}${location.hash}`} replace />;
};

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
            <PostHogUserSync />
            <VisitorPing />
            <SessionHealthCheck />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  {localizedRouteElements('home', <HomePage />)}
                  {localizedRouteElements('guide', <AutomatedResellingPlatformGuide />)}
                  {localizedRouteElements('articles', <ArticlesIndex />)}
                  {localizedRouteElements('priceChecker', <PriceCheckerPage />)}
                  {localizedRouteElements('vintedRelisting', <VintedRelistingToolArticle />)}
                  {localizedRouteElements('crosslistVintedFacebook', <CrossListVintedToFacebookMarketplaceArticle />)}
                  {localizedRouteElements('productRelisterVinted', <ProductRelisterForVintedArticle />)}
                  {localizedRouteElements('sellOnAllegro', <SellOnAllegroArticle />)}
                  {localizedRouteElements('priceForEbay', <HowToPriceItemsForEbayArticle />)}
                  {localizedRouteElements('ebayActiveVsSold', <EbayActiveListingsVsSoldPricesArticle />)}
                  {localizedRouteElements('usedItemValueGuide', <HowMuchIsMyUsedItemWorthArticle />)}
                  {localizedRouteElements('olxCountryAutomation', <OlxCountryAccountsArticle />)}
                  {localizedRouteElements('etsyListingTool', <EtsyListingToolArticle />)}
                  {localizedRouteElements('login', <LoginPage />)}
                  {localizedRouteElements('forgotPassword', <ForgotPasswordPage />)}
                  {localizedRouteElements('resetPassword', <ResetPasswordPage />)}
                  {localizedRouteElements('howItWorks', <HowItWorksPage />)}
                  {localizedRouteElements('successStories', <SuccessStoriesPage />)}
                  {localizedRouteElements('pricing', <PricingPage />)}
                  {/* <Route path="/features" element={<FeaturesPage />} /> */}
                  {localizedRouteElements('faq', <FAQPage />)}
                  {localizedRouteElements('getStarted', <GetStartedPage />)}
                  {localizedRouteElements('terms', <TermsPage />)}
                  {localizedRouteElements('privacy', <PrivacyPolicyPage />)}
                  {localizedRouteElements('cookies', <CookiesPolicyPage />)}
                  <Route element={<RequireAuth />}>
                    {localizedRouteElements('connectAccounts', <ConnectAccountsPage />)}
                    {localizedRouteElements('addItem', <AddItemPage />)}
                    {localizedRouteElements('userItems', <UserItemsPage />)}
                    {localizedRouteElements('itemDetail', <ItemDetailPage />)}
                    {localizedRouteElements('editItem', <EditItemPage />)}
                    {localizedRouteElements('statistics', <UserStatisticsPage />)}
                    {localizedRouteElements('settings', <SettingsPage />)}
                    {localizedRouteElements('platformSettings', <PlatformSettingsPage />)}
                  </Route>
                  {legacyLocalizedRoutes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={<LegacyLocalizedRedirect routeKey={route.key} />}
                    />
                  ))}
                  {/* <Route path="/olx/success" element={<OlxSuccessPage />} /> */}
                  
                  {/* Dev/Reference Pages (not linked in navigation) */}
                  <Route path="/dev/buttons" element={<ButtonShowcase />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <CookieBanner />
              <FirstListingCoach />
              <TawkChat />
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



