import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface PricingFAQProps {
  title: string;
  faqs: FAQItem[];
}

export const PricingFAQ = ({ title, faqs }: PricingFAQProps) => {
  return (
    <section className="relative border-t border-white/5 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-white md:text-3xl">
            {title}
          </h2>
          
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-lg border border-white/10 bg-neutral-950/70 px-5 transition-colors hover:border-cyan-400/35"
              >
                <AccordionTrigger className="py-4 text-left text-base font-semibold text-white hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-neutral-300 pb-4 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
