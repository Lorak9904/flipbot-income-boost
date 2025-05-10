
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ConnectAccountCard from '@/components/ConnectAccountCard';
import { CheckCircle, ArrowRight } from 'lucide-react';

const ConnectAccountsPage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [accountsConnected, setAccountsConnected] = useState(0);
  
  // For demo purposes, we'll track progress through steps
  const handleNextStep = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto text-center">
          <h1 className="font-bold mb-6">
            Connect <span className="gradient-text">Accounts</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Let FlipBot do the work for you. Connect your marketplace accounts and start earning extra income.
          </p>
        </div>
      </section>

      {/* Steps Progress */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto">
          <div className="flex justify-center">
            <div className="flex items-center max-w-3xl w-full">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${activeStep >= 1 ? 'bg-flipbot-teal text-white' : 'bg-gray-200 text-gray-500'}`}>
                {activeStep > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
              </div>
              <div className={`flex-1 h-1 mx-2 ${activeStep > 1 ? 'bg-flipbot-teal' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${activeStep >= 2 ? 'bg-flipbot-teal text-white' : 'bg-gray-200 text-gray-500'}`}>
                {activeStep > 2 ? <CheckCircle className="h-5 w-5" /> : '2'}
              </div>
              <div className={`flex-1 h-1 mx-2 ${activeStep > 2 ? 'bg-flipbot-teal' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${activeStep >= 3 ? 'bg-flipbot-teal text-white' : 'bg-gray-200 text-gray-500'}`}>
                3
              </div>
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
            <div className="max-w-3xl w-full flex">
              <div className="flex-1 text-center">
                <p className={`text-sm font-medium ${activeStep === 1 ? 'text-flipbot-teal' : activeStep > 1 ? 'text-gray-500' : 'text-gray-400'}`}>
                  Connect Accounts
                </p>
              </div>
              <div className="flex-1 text-center">
                <p className={`text-sm font-medium ${activeStep === 2 ? 'text-flipbot-teal' : activeStep > 2 ? 'text-gray-500' : 'text-gray-400'}`}>
                  Set Preferences
                </p>
              </div>
              <div className="flex-1 text-center">
                <p className={`text-sm font-medium ${activeStep === 3 ? 'text-flipbot-teal' : 'text-gray-400'}`}>
                  Start Flipping
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connect Accounts */}
      {activeStep === 1 && (
        <section className="section bg-gray-50">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Connect Your Marketplace Accounts</h2>
                <p className="text-gray-600">
                  Link your selling accounts so FlipBot can find deals and help you flip items for profit.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <ConnectAccountCard 
                  platform="facebook" 
                  platformName="Facebook" 
                  logoSrc="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png" 
                />
                
                <ConnectAccountCard 
                  platform="olx" 
                  platformName="OLX" 
                  logoSrc="https://upload.wikimedia.org/wikipedia/commons/9/91/Logotype_of_OLX.png" 
                />
                
                <ConnectAccountCard 
                  platform="vinted" 
                  platformName="Vinted" 
                  logoSrc="https://upload.wikimedia.org/wikipedia/commons/2/29/Vinted_logo.png" 
                />
              </div>
              
              <div className="mt-10 text-center">
                <Button onClick={handleNextStep} variant="default" size="xl" rounded="xl" className="animate-hover">
                  Continue <ArrowRight className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Set Preferences - Simplified for demo */}
      {activeStep === 2 && (
        <section className="section bg-gray-50">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Set Your Flipping Preferences</h2>
                <p className="text-gray-600">
                  Tell FlipBot what kind of items you want to flip and how you want to operate.
                </p>
              </div>
              
              {/* For the prototype, we'll show a simplified UI */}
              <div className="bg-white rounded-2xl p-8 shadow-md">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">What types of items do you want to flip?</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Electronics', 'Furniture', 'Clothing', 'Collectibles', 'Home Decor', 'Sports Equipment'].map((category) => (
                        <div key={category} className="bg-gray-100 hover:bg-flipbot-teal/10 hover:border-flipbot-teal/30 border border-gray-200 rounded-lg p-3 text-center cursor-pointer transition-colors">
                          {category}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">What's your maximum budget per item?</h3>
                    <div className="flex gap-3">
                      <input 
                        type="range" 
                        min="100" 
                        max="2000" 
                        step="100" 
                        defaultValue="500"
                        className="w-full accent-flipbot-teal" 
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>100 PLN</span>
                      <span>2,000 PLN</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Minimum profit target per flip</h3>
                    <div className="flex gap-3">
                      <div className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center bg-flipbot-teal/10 border-flipbot-teal/30">50 PLN</div>
                      <div className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center">100 PLN</div>
                      <div className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center">200 PLN</div>
                      <div className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center">300+ PLN</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 text-center">
                <Button onClick={handleNextStep} variant="default" size="xl" rounded="xl" className="animate-hover">
                  Save Preferences <ArrowRight className="ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Final Step - Start Flipping */}
      {activeStep === 3 && (
        <section className="section bg-gray-50">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <div className="bg-white rounded-2xl p-10 shadow-md">
                <div className="w-20 h-20 bg-flipbot-green/10 rounded-full mx-auto flex items-center justify-center mb-6">
                  <CheckCircle className="h-10 w-10 text-flipbot-green" />
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold mb-4">You're All Set!</h2>
                <p className="text-lg text-gray-600 mb-6">
                  FlipBot is now scanning for profitable items to flip. We'll notify you when we find something good!
                </p>
                
                <div className="bg-gray-50 p-6 rounded-xl mb-8">
                  <h3 className="font-semibold mb-3">What's happening now?</h3>
                  <ul className="text-left space-y-2">
                    <li className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full bg-flipbot-teal text-white flex items-center justify-center text-xs mt-0.5">1</div>
                      <span>FlipBot is scanning your connected marketplaces for undervalued items</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full bg-flipbot-teal text-white flex items-center justify-center text-xs mt-0.5">2</div>
                      <span>When we find a good deal, we'll notify you with all the details</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full bg-flipbot-teal text-white flex items-center justify-center text-xs mt-0.5">3</div>
                      <span>With one click, you can have FlipBot negotiate and secure the item</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full bg-flipbot-teal text-white flex items-center justify-center text-xs mt-0.5">4</div>
                      <span>We'll help you list it for the optimal price and handle communication with buyers</span>
                    </li>
                  </ul>
                </div>
                
                <Button asChild variant="success" size="xl" rounded="xl" className="animate-hover">
                  <Link to="/dashboard">View Your Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Info Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-xl mb-4">Safe & Secure</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-flipbot-teal/10 rounded-full flex items-center justify-center mb-3">
                    <Lock className="h-6 w-6 text-flipbot-teal" />
                  </div>
                  <p className="text-sm text-gray-600">Your data is encrypted and stored securely</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-flipbot-teal/10 rounded-full flex items-center justify-center mb-3">
                    <svg className="h-6 w-6 text-flipbot-teal" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12zm-.75-6.75a.75.75 0 000 1.5h2.5a.75.75 0 000-1.5h-2.5z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">We never post without your explicit permission</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-flipbot-teal/10 rounded-full flex items-center justify-center mb-3">
                    <svg className="h-6 w-6 text-flipbot-teal" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">You're always in control of your accounts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConnectAccountsPage;
