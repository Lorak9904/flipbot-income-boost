
import { ArrowRight, Search, MessageSquare, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="badge">Coming Soon</div>
              <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl leading-tight">
                Turn Online Finds into <span className="text-flipbot-teal">Real Profits</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-lg">
                FlipIt scans marketplaces, finds undervalued items, and helps you resell them for profit — all on autopilot.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild className="cta-btn">
                  <Link to="/get-started">Start flipping today</Link>
                </Button>
                <Button asChild variant="outline" className="border-flipbot-teal text-flipbot-teal hover:bg-flipbot-teal/5">
                  <Link to="/how-it-works">See how it works <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">FlipIt Assistant</h4>
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    I want to make some extra money. Can you help?
                  </div>
                  <div className="bg-flipbot-teal/10 rounded-lg p-3 ml-auto max-w-[80%] text-flipbot-teal">
                    I found a coffee table listed for 220 PLN that's selling for 600 PLN on other sites. Should I contact the seller?
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    Yes! Send them a message!
                  </div>
                  <div className="bg-flipbot-teal/10 rounded-lg p-3 ml-auto max-w-[80%] text-flipbot-teal">
                    Great! I've drafted a message for you to send. Would you like to review it?
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="section bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How FlipIt Makes You Money</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered assistant handles the entire flipping process, so you can earn passive income with minimal effort.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-flipbot-teal/10 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-flipbot-teal" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Marketplace Scanner</h3>
              <p className="text-gray-600">
                FlipIt continuously scans OLX, Allegro, and Facebook Marketplace to find undervalued items with high profit potential.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-flipbot-teal/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-flipbot-teal" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automated Negotiations</h3>
              <p className="text-gray-600">
                Let FlipIt handle communication with sellers, negotiate prices, and secure the best deals on your behalf.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-flipbot-teal/10 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-flipbot-teal" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Profit Maximizer</h3>
              <p className="text-gray-600">
                Get data-driven recommendations for optimal listing prices and strategies to maximize your resale profits.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild className="secondary-btn">
              <Link to="/features">Explore all features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonial Preview */}
      <section className="section bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Results from Real People</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how everyday people are using FlipIt to create a reliable side income.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" 
                  alt="Marta K." 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-semibold text-lg">Marta K.</h4>
                <p className="text-gray-600">Warsaw, Poland</p>
              </div>
            </div>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              ))}
            </div>
            <blockquote className="text-lg text-gray-800 mb-6">
              "I made over 600 PLN in my first weekend using FlipIt! It found a vintage cabinet on OLX for 350 PLN that I resold for 950 PLN. The AI even handled most of the messaging with the buyer and seller."
            </blockquote>
            <p className="text-flipbot-orange font-medium">
              +600 PLN profit in one weekend
            </p>
          </div>

          <div className="text-center mt-12">
            <Button asChild className="secondary-btn">
              <Link to="/success-stories">Read more success stories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-flipbot-teal/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Making Money?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Join the waitlist now and be among the first to access FlipIt when we launch.
          </p>
          <Button asChild size="lg" className="cta-btn text-lg px-8 py-6">
            <Link to="/get-started">Get Early Access</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
