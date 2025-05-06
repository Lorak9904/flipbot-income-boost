
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Users } from 'lucide-react';

const GetStartedPage = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "You're on the waitlist!",
        description: "We'll notify you when FlipBot AI launches.",
      });
    }, 1500);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto text-center">
          <h1 className="font-bold mb-6">
            Join the <span className="text-flipbot-teal">Waitlist</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Be among the first to access FlipBot AI and start earning extra income through resale arbitrage.
          </p>
        </div>
      </section>

      {/* Waitlist Form */}
      <section className="section bg-white">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8 md:p-12 shadow-md">
              {!isSubmitted ? (
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-6">
                    Get Early Access to FlipBot AI
                  </h2>
                  <div className="flex items-center gap-2 text-flipbot-orange mb-8">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">143 people already on the waitlist</span>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block font-medium">
                        Your Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flipbot-teal"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="block font-medium">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flipbot-teal"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="cta-btn w-full py-6 text-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
                    </Button>
                  </form>
                  
                  <p className="text-sm text-gray-500 mt-6 text-center">
                    We respect your privacy and will never share your information.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    You're on the Waitlist!
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Thank you for your interest in FlipBot AI. We'll notify you when we launch!
                  </p>
                  <div className="bg-white p-6 rounded-lg border border-gray-200 mx-auto max-w-md">
                    <h4 className="font-medium mb-2">While you wait...</h4>
                    <p className="text-gray-600 mb-4">
                      Start thinking about what items you'd like to flip and which marketplaces you're most familiar with.
                    </p>
                    <p className="text-gray-600">
                      The average FlipBot user makes their first profit within 7 days of getting access!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-flipbot-teal/5">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">
              What You'll Get As An Early User
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-flipbot-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-flipbot-orange font-medium">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Priority Access</h3>
                  <p className="text-gray-600">
                    Be among the first to use FlipBot AI when we launch, ahead of the general public.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-flipbot-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-flipbot-orange font-medium">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Founding Member Discount</h3>
                  <p className="text-gray-600">
                    Enjoy special pricing that will be grandfathered in even after we increase prices.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-flipbot-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-flipbot-orange font-medium">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Direct Support</h3>
                  <p className="text-gray-600">
                    Get personalized onboarding and direct access to our team to maximize your success.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm">
                <div className="w-10 h-10 bg-flipbot-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-flipbot-orange font-medium">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-2">Feature Influence</h3>
                  <p className="text-gray-600">
                    Help shape the future of FlipBot by providing feedback that influences our development roadmap.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GetStartedPage;
