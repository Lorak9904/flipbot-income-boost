
import { Link } from 'react-router-dom';
import { Search, MessageSquare, Image, DollarSign, Shield, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FeaturesPage = () => {
  const features = [
    {
      icon: <Search className="h-6 w-6 text-flipbot-teal" />,
      title: "Marketplace Scanner",
      description: "Our AI continuously scans OLX, Allegro, and Facebook Marketplace to find undervalued items with high profit potential."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-flipbot-teal" />,
      title: "Price Analysis",
      description: "FlipBot compares prices across multiple platforms to identify the best deals and highest profit margins."
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-flipbot-teal" />,
      title: "Automated Negotiations",
      description: "Let FlipBot handle communication with sellers, negotiate prices, and secure the best deals on your behalf."
    },
    {
      icon: <Image className="h-6 w-6 text-flipbot-teal" />,
      title: "Listing Management",
      description: "Create professional, SEO-optimized listings that attract buyers and maximize your selling price."
    },
    {
      icon: <Shield className="h-6 w-6 text-flipbot-teal" />,
      title: "Privacy Protection",
      description: "FlipBot acts as an intermediary to protect your personal information when dealing with buyers and sellers."
    },
    {
      icon: <Clock className="h-6 w-6 text-flipbot-teal" />,
      title: "Time-Saving Automation",
      description: "Save hours of searching, messaging, and listing by letting FlipBot handle the tedious parts of the flipping process."
    },
    {
      icon: <DollarSign className="h-6 w-6 text-flipbot-teal" />,
      title: "Profit Tracking",
      description: "Keep track of your purchases, sales, and profits with detailed analytics and reporting."
    },
    {
      icon: <Sparkles className="h-6 w-6 text-flipbot-teal" />,
      title: "AI-Enhanced Photos",
      description: "Automatically enhance product photos to make your listings more attractive and professional."
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto text-center">
          <h1 className="font-bold mb-6">
            FlipIt <span className="text-flipbot-teal">Features</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover all the powerful tools and features that make FlipBot the ultimate 
            assistant for resale arbitrage and passive income generation.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-flipbot-teal/10 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlight */}
      <section className="section bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Automated Profit Generation</h2>
              <p className="text-lg text-gray-600 mb-6">
                FlipBot is designed to handle the entire resale arbitrage process from start to finish:
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-flipbot-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-flipbot-teal font-medium">1</span>
                  </div>
                  <p>FlipBot scans marketplaces 24/7 to find the best deals with highest profit potential</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-flipbot-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-flipbot-teal font-medium">2</span>
                  </div>
                  <p>You approve the deals you want to pursue - always maintaining full control</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-flipbot-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-flipbot-teal font-medium">3</span>
                  </div>
                  <p>FlipBot negotiates with sellers to get the best possible price</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-flipbot-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-flipbot-teal font-medium">4</span>
                  </div>
                  <p>You handle the pickup/delivery of items (the only manual step)</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-flipbot-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-flipbot-teal font-medium">5</span>
                  </div>
                  <p>FlipBot creates professional listings and handles communication with buyers</p>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-flipbot-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-flipbot-teal font-medium">6</span>
                  </div>
                  <p>You collect the profits while FlipBot finds your next opportunity</p>
                </li>
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-md">
                <h3 className="text-xl font-semibold mb-4 text-center">Your Potential Earnings</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-flipbot-teal/5 border border-flipbot-teal/20">
                    <p className="font-medium mb-2">Weekend Flipper</p>
                    <p className="text-gray-600 mb-4">Spend 2-3 hours on weekends picking up and delivering items</p>
                    <p className="text-flipbot-orange font-semibold text-xl">400-800 PLN/month</p>
                  </div>
                  <div className="p-4 rounded-lg bg-flipbot-teal/5 border border-flipbot-teal/20">
                    <p className="font-medium mb-2">Part-Time Flipper</p>
                    <p className="text-gray-600 mb-4">Dedicate 5-10 hours per week to flipping multiple items</p>
                    <p className="text-flipbot-orange font-semibold text-xl">1500-3000 PLN/month</p>
                  </div>
                  <div className="p-4 rounded-lg bg-flipbot-orange/5 border border-flipbot-orange/20">
                    <p className="font-medium mb-2">Power Flipper</p>
                    <p className="text-gray-600 mb-4">Treat flipping as a serious side business (15+ hours/week)</p>
                    <p className="text-flipbot-orange font-semibold text-xl">4000+ PLN/month</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">*Earnings vary based on individual effort, item selection, and market conditions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-flipbot-teal/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Making Money with FlipBot?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Join our waitlist now to be among the first to access FlipIt when we launch.
          </p>
          <Button asChild size="lg" className="cta-btn text-lg px-8 py-6">
            <Link to="/get-started">Join the Waitlist</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
