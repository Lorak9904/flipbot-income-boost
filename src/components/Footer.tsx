
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-immersive text-white pt-16 pb-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-flipit-teal flex items-center justify-center text-white font-bold text-sm">
                FI
              </div>
              <span className="font-heading font-semibold text-lg">FlipIt</span>
            </Link>
            <p className="text-gray-300 mb-4">
              The intelligent agent that helps you earn extra income through resale arbitrage.
            </p>
            <div className="badge bg-flipit-teal/30 text-white">Coming Soon</div>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-gray-300 hover:text-flipit-teal transition-colors">Features</Link></li>
              <li><Link to="/how-it-works" className="text-gray-300 hover:text-flipit-teal transition-colors">How It Works</Link></li>
              <li><Link to="/success-stories" className="text-gray-300 hover:text-flipit-teal transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-gray-300 hover:text-flipit-teal transition-colors">FAQ</Link></li>
              <li><a href="#" className="text-gray-300 hover:text-flipit-teal transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-flipit-teal transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-semibold mb-4">Join Waitlist</h4>
            <p className="text-gray-300 mb-4">
              Be the first to know when FlipIt launches.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-4 py-2 border border-gray-300 bg-flipit-dark text-white rounded-md focus:outline-none focus:ring-2 focus:ring-flipit-teal placeholder-gray-400"
                required
              />
              <button type="submit" className="dark-btn whitespace-nowrap">
                Join Now
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 mt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} FlipIt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
