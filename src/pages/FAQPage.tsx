
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQPage = () => {
  const faqs = [
    {
      question: "Do I need technical skills to use FlipIt?",
      answer: "Not at all! FlipIt is designed to be user-friendly and requires no technical skills. If you can use a smartphone and basic messaging apps, you can use FlipIt. The AI handles all the complex parts of finding deals, messaging, and creating listings."
    },
    {
      question: "Is resale arbitrage legal?",
      answer: "Yes, resale arbitrage is completely legal. It's simply the process of buying items and reselling them for a profit, which is the basis of most retail businesses. FlipIt helps you do this more efficiently by finding undervalued items and automating much of the process."
    },
    {
      question: "How much can I earn using FlipIt?",
      answer: "Earnings vary based on how much time you invest and the types of items you choose to flip. Some users make a few hundred PLN per month as a casual side income, while more dedicated users can earn several thousand PLN monthly. The more deals you complete, the more you can potentially earn."
    },
    {
      question: "Do I need starting capital to begin flipping?",
      answer: "You do need some money to purchase items before reselling them. However, you can start with as little as 100-200 PLN for small items. As you make profits, you can reinvest to flip higher-value items with better margins. Many users start small and gradually scale up their flipping business."
    },
    {
      question: "What types of items work best for flipping?",
      answer: "Furniture, electronics, collectibles, and brand-name items typically offer good profit margins. FlipIt is particularly good at identifying items with high demand and significant price disparities across different marketplaces. The AI will recommend the most profitable items based on current market conditions."
    },
    {
      question: "How much time do I need to dedicate to flipping?",
      answer: "FlipIt handles most of the time-consuming aspects (searching, messaging, creating listings). The only parts you need to handle personally are approving deals and physically picking up and delivering items. Most users spend just 2-5 hours per week and still generate meaningful income."
    },
    {
      question: "How does FlipIt find profitable deals?",
      answer: "FlipIt continuously scans multiple marketplaces like OLX, Allegro, and Facebook Marketplace. It uses AI to compare prices across platforms, identify undervalued listings, and calculate potential profit margins. The AI also considers factors like item condition, seller flexibility, and market demand."
    },
    {
      question: "Is my personal information safe when FlipIt messages sellers?",
      answer: "Yes, FlipIt is designed with privacy in mind. When interacting with sellers, FlipIt acts as your representative without sharing your personal details. All communication is handled through the platform securely."
    },
    {
      question: "When will FlipIt be available?",
      answer: "FlipIt is currently in the final stages of testing with a limited group of beta users. We anticipate a public launch in the coming months. By joining our waitlist, you'll be among the first to know when access becomes available."
    }
  ];

  // State to track which FAQ item is open
  const [openItem, setOpenItem] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    if (openItem === index) {
      setOpenItem(null);
    } else {
      setOpenItem(index);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto text-center">
          <h1 className="font-bold mb-6">
            Frequently Asked <span className="text-flipbot-teal">Questions</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about FlipIt and how it can help you earn extra income through resale arbitrage.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="section bg-white">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full flex justify-between items-center p-5 text-left font-medium focus:outline-none"
                    onClick={() => toggleItem(index)}
                  >
                    <span>{faq.question}</span>
                    {openItem === index ? 
                      <ChevronUp className="h-5 w-5 text-flipbot-teal" /> : 
                      <ChevronDown className="h-5 w-5 text-flipbot-teal" />
                    }
                  </button>
                  {openItem === index && (
                    <div className="p-5 bg-gray-50 border-t border-gray-200 animate-accordion-down">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 md:py-20 bg-flipbot-teal/5">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Still Have Questions?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            We're here to help! Contact our team directly and we'll get back to you as soon as possible.
          </p>
          <Button asChild className="secondary-btn">
            <a href="mailto:support@flipbotai.com">Contact Us</a>
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Making Money with FlipIt?</h2>
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

export default FAQPage;
