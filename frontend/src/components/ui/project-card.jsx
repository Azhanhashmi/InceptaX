import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ProjectCard = React.forwardRef(
  ({ className, imgSrc, title, description, link, linkText = "View Project", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("group relative flex cursor-pointer flex-col overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1", className)}
        style={{
          borderRadius: "14px",
          border: "1px solid var(--ox-border)",
          background: "var(--ox-card, #111)",
          transition: "all .22s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,107,0,0.2)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--ox-border)"; }}
        {...props}
      >
        {/* Image */}
        <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
          <img
            src={imgSrc}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
            className="group-hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "22px" }}>
          <h3
            className="transition-colors duration-300 group-hover:text-[var(--ox-orange)]"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: "16px", color: "var(--ox-text)", letterSpacing: "-0.01em", marginBottom: "8px" }}
          >
            {title}
          </h3>
          <p style={{ fontSize: "13.5px", color: "var(--ox-muted)", lineHeight: 1.7, fontWeight: 400, flex: 1 }}>
            {description}
          </p>
          {link && (
            
            <a  href={link}
              className="group/button mt-4 inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 hover:underline"
              style={{ color: "var(--ox-orange)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {linkText}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/button:translate-x-1" />
            </a>
          )}
        </div>
      </div>
    );
  }
);
ProjectCard.displayName = "ProjectCard";

export { ProjectCard };