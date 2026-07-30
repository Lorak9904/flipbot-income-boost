import { Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  location: string;
}

interface TrustSectionProps {
  title: string;
  testimonials: Testimonial[];
}

export const TrustSection = ({ title, testimonials }: TrustSectionProps) => {
  return (
    <section className="relative border-y border-white/5 bg-neutral-950/45 py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 text-center text-2xl font-bold text-white md:text-3xl">
          {title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <article
              key={index}
              className="rounded-xl border border-white/10 bg-neutral-900/65 p-6"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-orange-400 fill-orange-400" />
                ))}
              </div>
              
              <p className="text-neutral-200 italic leading-relaxed mb-4">
                "{testimonial.quote}"
              </p>
              
              <div className="border-t border-neutral-700/50 pt-4">
                <p className="text-sm font-medium text-white">{testimonial.author}</p>
                <p className="text-xs text-neutral-400">{testimonial.location}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
