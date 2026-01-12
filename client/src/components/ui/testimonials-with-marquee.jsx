import { cn } from "../../lib/utils";
import "./testimonials-marquee.css";

export function TestimonialsSection({ 
  title,
  description,
  testimonials,
  className 
}) {
  return (
    <section className={cn(
      "bg-[#0a0a0a]",
      "py-12 sm:py-24 md:py-32 px-0",
      className
    )}>
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-8 sm:gap-16">
        <div className="flex flex-col items-center gap-4 px-4 sm:gap-8">
          <h2 className="max-w-[720px] text-3xl font-bold leading-tight text-white sm:text-5xl sm:leading-tight">
            {title}
          </h2>
          <p className="text-lg max-w-[600px] font-normal text-gray-400 sm:text-xl">
            {description}
          </p>
        </div>

        <div className="testimonials-marquee-wrapper relative">
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />

          <div className="testimonials-track">
            {[...testimonials, ...testimonials].map((item, index) => (
              <div
                key={index}
                className="min-w-[320px] max-w-[320px] flex-shrink-0 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 text-white shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={item.author.avatar}
                    alt={item.author.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{item.author.name}</h4>
                    <p className="text-sm text-white/60">{item.author.handle}</p>
                  </div>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
