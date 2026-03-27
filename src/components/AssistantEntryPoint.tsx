import { motion } from "framer-motion";
import { Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Prompt {
  label: string;
  link?: string;
  href?: string;
}

interface AssistantEntryPointProps {
  prompts: Prompt[];
  className?: string;
}

const AssistantEntryPoint = ({ prompts, className = "" }: AssistantEntryPointProps) => {
  return (
    <section className={`py-12 md:py-16 ${className}`}>
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border bg-card p-6 md:p-8"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles size={14} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-heading font-bold">SanKash Assistant</p>
              <p className="text-[11px] text-muted-foreground">Quick answers and guided next steps</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {prompts.map((prompt) => {
              const inner = (
                <span className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border bg-background text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors duration-200 cursor-pointer">
                  <MessageSquare size={12} className="text-primary shrink-0" />
                  {prompt.label}
                  <ArrowRight size={10} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </span>
              );

              if (prompt.link) {
                return (
                  <Link key={prompt.label} to={prompt.link}>
                    {inner}
                  </Link>
                );
              }
              return (
                <a key={prompt.label} href={prompt.href || "#"}>
                  {inner}
                </a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AssistantEntryPoint;
