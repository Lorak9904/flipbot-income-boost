
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-16 pb-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-flipbot-teal flex items-center justify-center text-white font-bold text-sm">
                FB
              </div>
              <span className="font-heading font-semibold text-lg">FlipIt</span>
            </Link>
            <p className="text-gray-600 mb-4">
              The intelligent agent that helps you earn extra income through resale arbitrage.
            </p>
            <div className="badge">Coming Soon</div>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-gray-600 hover:text-flipbot-teal transition-colors">Features</Link></li>
              <li><Link to="/how-it-works" className="text-gray-600 hover:text-flipbot-teal transition-colors">How It Works</Link></li>
              <li><Link to="/success-stories" className="text-gray-600 hover:text-flipbot-teal transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-gray-600 hover:text-flipbot-teal transition-colors">FAQ</Link></li>
              <li><a href="#" className="text-gray-600 hover:text-flipbot-teal transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-flipbot-teal transition-colors">Privacy Policy</a></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-flipbot-teal transition-colors">Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-4">Join Waitlist</h4>
            <p className="text-gray-600 mb-4">
              Be the first to know when FlipIt launches.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              {/* <input 
                type="email" 
                placeholder="Your email" 
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-flipbot-teal"
                required
              /> */}
              <button type="submit" className="secondary-btn whitespace-nowrap">
                Join Now
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 mt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} FlipIt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
