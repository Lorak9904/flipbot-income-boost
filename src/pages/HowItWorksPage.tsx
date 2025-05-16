
import { Link } from 'react-router-dom';
import { Search, MessageSquare, Image, DollarSign, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HowItWorksPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto text-center">
          <h1 className="font-bold mb-6">
            How FlipIt <span className="text-flipbot-teal">Works</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Our AI-powered assistant handles the tedious parts of resale arbitrage,
            so you can focus on choosing items and collecting profits.
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="section bg-white">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <div className="col-span-1 flex flex-col items-center md:items-start">
                <div className="w-16 h-16 bg-flipbot-teal/10 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-flipbot-teal" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Discovery</h3>
              </div>
              <div className="col-span-2">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold mb-4">FlipIt scans local marketplaces to find undervalued items</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-flipbot-teal mt-0.5 flex-shrink-0" />
                      <span>Continuously scans OLX, Allegro, Facebook Marketplace, and other sites</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-flipbot-teal mt-0.5 flex-shrink-0" />
                      <span>Analyzes pricing across different platforms to identify potential deals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-flipbot-teal mt-0.5 flex-shrink-0" />
                      <span>Prioritizes items with the highest profit margins and fastest selling potential</span>
                    </li>
                  </ul>
                  <div className="mt-6 bg-white rounded-lg p-4 border border-gray-100">
                    <p className="italic text-gray-600">
                      "FlipBot found an IKEA desk listed for 150 PLN when the same model was selling for 400 PLN elsewhere. I wouldn't have caught this opportunity on my own!"
                    </p>
                    <p className="text-sm font-medium mt-2">— Tomasz W., FlipBot user</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <div className="col-span-1 flex flex-col items-center md:items-start">
                <div className="w-16 h-16 bg-flipbot-teal/10 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-flipbot-teal" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Negotiation</h3>
              </div>
              <div className="col-span-2">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold mb-4">FlipBot handles communication and negotiation with sellers</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-flipbot-teal mt-0.5 flex-shrink-0" />
                      <span>Creates personalized messages to initiate contact with sellers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-flipbot-teal mt-0.5 flex-shrink-0" />
                      <span>Negotiates prices intelligently to maximize your profit margins</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-flipbot-teal mt-0.5 flex-shrink-0" />
                      <span>Asks relevant questions about item condition and coordinates pickup/delivery</span>
                    </li>
                  </ul>
                  <div className="mt-6 p-4 rounded-lg bg-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-flipbot-teal rounded-full flex items-center justify-center text-white font-bold text-xs">
                        FB
                      </div>
                      <p className="font-medium">FlipBot (on your behalf)</p>
                    </div>
                    <p className="mb-3 bg-white p-3 rounded-md shadow-sm">
                      "Dzień dobry! I'm interested in the coffee table you're selling. Is it still available? I could pick it up tomorrow afternoon if the price is right."
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        S
                      </div>
                      <p className="font-medium">Seller</p>
                    </div>
                    <p className="bg-white p-3 rounded-md shadow-sm">
                      "Hello, yes it's still available. When can you come to pick it up?"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <div className="col-span-1 flex flex-col items-center md:items-start">
                <div className="w-16 h-16 bg-flipbot-teal/10 rounded-full flex items-center justify-center mb-4">
                  <Image className="h-8 w-8 text-flipbot-teal" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Listing</h3>
              </div>
              <div className="col-span-2">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold mb-4">FlipBot creates optimized listings to sell your items</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-flipbot-teal mt-0.5 flex-shrink-0" />
                      <span>Creates professional, SEO-optimized listings that attract buyers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-flipbot-teal mt-0.5 flex-shrink-0" />
                      <span>Enhances product photos using AI to make items look more attractive</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-flipbot-teal mt-0.5 flex-shrink-0" />
                      <span>Lists items on multiple platforms to reach the widest audience</span>
                    </li>
                  </ul>
                  <div className="mt-6 bg-white rounded-lg p-4 border border-gray-100 flex flex-col gap-4">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-3 border-b border-gray-200 font-medium">Listing Preview</div>
                      <div className="p-4">
                        <h5 className="font-semibold mb-1">Vintage Mid-Century Coffee Table - Perfect Condition</h5>
                        <p className="text-flipbot-orange font-medium mb-2">560 PLN</p>
                        <p className="text-sm text-gray-600">
                          Beautiful vintage coffee table in excellent condition. Solid wood construction with 
                          elegant mid-century design. Perfect for any living room. Dimensions: 120x60x45cm.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <div className="col-span-1 flex flex-col items-center md:items-start">
                <div className="w-16 h-16 bg-flipbot-teal/10 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="h-8 w-8 text-flipbot-teal" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">Profit</h3>
              </div>
              <div className="col-span-2">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold mb-4">You collect the profit while FlipBot handles everything else</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-flipbot-teal mt-0.5 flex-shrink-0" />
                      <span>Responds to buyer inquiries automatically with relevant information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-flipbot-teal mt-0.5 flex-shrink-0" />
                      <span>Coordinates pickup/delivery and payment methods</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-flipbot-teal mt-0.5 flex-shrink-0" />
                      <span>Tracks your profits and provides detailed analytics on your flipping business</span>
                    </li>
                  </ul>
                  <div className="mt-6 bg-white rounded-lg p-4 border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-semibold">Transaction Summary</h5>
                      <p className="badge">Completed</p>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <p className="text-gray-600">Purchase Price:</p>
                        <p>220 PLN</p>
                      </div>
                      <div className="flex justify-between">
                        <p className="text-gray-600">Selling Price:</p>
                        <p>560 PLN</p>
                      </div>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="flex justify-between font-semibold">
                        <p>Your Profit:</p>
                        <p className="text-flipbot-orange">+340 PLN</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-flipbot-teal/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Flipping?</h2>
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

export default HowItWorksPage;
