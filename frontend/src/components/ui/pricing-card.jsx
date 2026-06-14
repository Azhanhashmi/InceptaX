import { cn } from "@/lib/utils";

export function Card({ className, style, ...props }) {
  return (
    <div
      {...props}
      style={{
        background: "var(--ox-card, #111)",
        border: "1px solid var(--ox-border)",
        borderRadius: "16px",
        padding: "6px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        backdropFilter: "blur(12px)",
        position: "relative",
        width: "100%",
        ...style,
      }}
    />
  );
}

export function Header({ className, glassEffect = true, children, style, ...props }) {
  return (
    <div
      {...props}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "4px",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {glassEffect && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0, top: 0, left: 0, right: 0,
            height: "120px", borderRadius: "inherit",
            background: "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
      )}
      {children}
    </div>
  );
}

export function Plan({ style, ...props }) {
  return (
    <div
      {...props}
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", ...style }}
    />
  );
}

export function PlanName({ style, ...props }) {
  return (
    <div
      {...props}
      style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "var(--ox-muted)", ...style }}
    />
  );
}

export function Badge({ style, ...props }) {
  return (
    <span
      {...props}
      style={{
        border: "1px solid var(--ox-border)", color: "var(--ox-muted)",
        borderRadius: "100px", padding: "2px 10px", fontSize: "11px", fontWeight: 500,
        ...style,
      }}
    />
  );
}

export function Price({ style, ...props }) {
  return (
    <div {...props} style={{ display: "flex", alignItems: "flex-end", gap: "4px", marginBottom: "16px", ...style }} />
  );
}

export function MainPrice({ style, ...props }) {
  return (
    <span
      {...props}
      style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: "36px", color: "var(--ox-text)", letterSpacing: "-0.03em", ...style }}
    />
  );
}

export function Period({ style, ...props }) {
  return (
    <span {...props} style={{ fontSize: "13px", color: "var(--ox-muted)", paddingBottom: "6px", ...style }} />
  );
}

export function OriginalPrice({ style, ...props }) {
  return (
    <span {...props} style={{ fontSize: "16px", color: "var(--ox-muted)", textDecoration: "line-through", marginLeft: "auto", marginRight: "4px", ...style }} />
  );
}

export function Body({ style, ...props }) {
  return (
    <div {...props} style={{ padding: "16px 12px", display: "flex", flexDirection: "column", gap: "20px", ...style }} />
  );
}

export function List({ style, ...props }) {
  return (
    <ul {...props} style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "10px", ...style }} />
  );
}

export function ListItem({ style, ...props }) {
  return (
    <li {...props} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "var(--ox-muted)", ...style }} />
  );
}

export function Separator({ children = "Upgrade to access", style, ...props }) {
  return (
    <div {...props} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", color: "var(--ox-subtle)", ...style }}>
      <span style={{ flex: 1, height: "1px", background: "var(--ox-border)" }} />
      <span style={{ flexShrink: 0 }}>{children}</span>
      <span style={{ flex: 1, height: "1px", background: "var(--ox-border)" }} />
    </div>
  );
}