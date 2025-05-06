
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    id: 1,
    name: 'Marta K.',
    location: 'Warsaw, Poland',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    quote: 'I made over 600 PLN in my first weekend using FlipBot! It found a vintage cabinet on OLX for 350 PLN that I resold for 950 PLN. The AI even handled most of the messaging with the buyer and seller.',
    highlight: '+600 PLN profit in one weekend',
    rating: 5
  },
  {
    id: 2,
    name: 'Piotr G.',
    location: 'Kraków, Poland',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    quote: 'As a student, I needed extra income but had limited time. FlipBot changed everything! It found a PS5 bundle for 1,200 PLN that I flipped for 1,850 PLN in just 3 days. The bot handled all the negotiation - I just did the pickup and drop-off.',
    highlight: '+650 PLN profit with minimal effort',
    rating: 5
  },
  {
    id: 3,
    name: 'Anna M.',
    location: 'Wrocław, Poland',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    quote: 'I was skeptical at first, but FlipBot actually works! In my first month, I made over 2,000 PLN flipping furniture while working my regular job. The AI's ability to spot good deals is impressive, and the automatic messaging saves me hours.',
    highlight: '+2,000 PLN extra income per month',
    rating: 4
  },
  {
    id: 4,
    name: 'Tomasz W.',
    location: 'Poznań, Poland',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    quote: 'FlipBot found an IKEA desk listed for 150 PLN when the same model was selling for 400 PLN elsewhere. I wouldn\'t have caught this opportunity on my own! The profit margin was amazing, and I\'ve since flipped several more furniture items.',
    highlight: 'Found deals I would have missed',
    rating: 5
  },
];

const SuccessStoriesPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto text-center">
          <h1 className="font-bold mb-6">
            Success <span className="text-flipbot-teal">Stories</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Real people making real profits with FlipBot AI.
            See how our users are turning marketplace opportunities into extra income.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-12">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id} 
                className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-gray-100"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xl">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.location}</p>
                    <div className="flex gap-1 mt-2">
                      {[...Array(5)].map((_, index) => (
                        <svg 
                          key={index} 
                          className={`w-5 h-5 ${index < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <blockquote className="text-lg text-gray-800 mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="bg-flipbot-orange/10 p-4 rounded-lg inline-block">
                  <p className="text-flipbot-orange font-medium">
                    {testimonial.highlight}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-16 md:py-20 bg-flipbot-teal/10">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              "FlipBot AI has helped users generate over 15,000 PLN in collective profits during our beta testing phase."
            </h2>
            <p className="text-xl font-medium">— FlipBot Founder</p>
          </div>
        </div>
      </section>

      {/* Your Success Story */}
      <section className="section bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Write Your Success Story?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Join our waitlist now to be among the first to access FlipBot AI when we launch.
          </p>
          <Button asChild size="lg" className="cta-btn text-lg px-8 py-6">
            <Link to="/get-started">Join the Waitlist</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default SuccessStoriesPage;
