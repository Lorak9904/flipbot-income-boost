import { motion } from 'framer-motion';
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 0.6, ease: 'easeOut' },
  }),
};

export const TrustSection = ({ title, testimonials }: TrustSectionProps) => {
  return (
    <section className="relative py-16 bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10">
      <div className="container mx-auto px-4">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-2xl md:text-3xl font-bold mb-12 text-center text-white"
        >
          {title}
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              custom={index + 1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="bg-neutral-900/60 backdrop-blur-sm rounded-xl p-6 ring-1 ring-neutral-700/30 hover:ring-cyan-400/20 transition-all hover:-translate-y-1 hover:shadow-lg"
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
