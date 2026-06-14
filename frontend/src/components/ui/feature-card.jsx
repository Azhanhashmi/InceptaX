import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
const FeatureCard = React.forwardRef(
  ({ className, icon, title, description, link, linkText = "Learn more", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "ox-card group relative flex flex-col p-7 transition-all duration-300 ease-in-out hover:-translate-y-1",
          className
        )}
        style={{
          transition: "all .22s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,107,0,0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--ox-border)";
        }}
        {...props}
      >
        {/* Icon box */}
        <div
          className="flex items-center justify-center mb-5 rounded-xl transition-colors duration-300 group-hover:border-[rgba(255,107,0,0.25)]"
          style={{
            width: "44px",
            height: "44px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#fff",
          }}
        >
          <div style={{ width: "22px", height: "22px" }}>{icon}</div>
        </div>

        {/* Title */}
        <h3
          className="transition-colors duration-300 group-hover:text-[var(--ox-orange)]"
          style={{
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontWeight: 700,
            fontSize: "16px",
            color: "var(--ox-text)",
            letterSpacing: "-0.01em",
            marginBottom: "10px",
          }}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className="flex-1"
          style={{
            fontSize: "13.5px",
            color: "var(--ox-muted)",
            lineHeight: 1.7,
            fontWeight: 400,
          }}
        >
          {description}
        </p>

        {/* Optional CTA link */}
        {link && (
          
          <a  href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="group/button mt-4 inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 hover:underline"
            style={{ color: "var(--ox-orange)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {linkText}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
          </a>
        )}
      </div>
    );
  }
);
FeatureCard.displayName = "FeatureCard";

export { FeatureCard };