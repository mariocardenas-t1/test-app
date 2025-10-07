import { ReactNode, createContext, useContext, useCallback } from "react";
import { useTracking } from "../../context/TrackingContext";

interface CardProps {
  children: ReactNode;
  borderStyle?: "solid" | "dashed" | "none";
}

const CardContext = createContext<{ borderStyle: "solid" | "dashed" | "none" }>(
  {
    borderStyle: "solid"
  }
);

function Card({ children, borderStyle = "solid" }: CardProps) {
  const { track } = useTracking();

  const emitEvent = useCallback(
    (action: "hover" | "click") => {
      track({
        componentName: "Card",
        action,
        variant: borderStyle,
      });
    },
    [borderStyle, track]
  );

  return (
    <CardContext.Provider value={{ borderStyle }}>
      <div
        style={{
          border: borderStyle === "none" ? "none" : `2px ${borderStyle} #ccc`,
          borderRadius: "8px",
          overflow: "hidden",
          maxWidth: "400px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}
        onMouseEnter={() => emitEvent("hover")}
        onClick={() => emitEvent("click")}
      >
        {children}
      </div>
    </CardContext.Provider>
  );
}

function Header({ children }: { children: ReactNode }) {
  const { borderStyle } = useContext(CardContext);
  return (
    <div
      style={{
        padding: "1rem",
        borderBottom:
          borderStyle === "none" ? "none" : `1px ${borderStyle} #ccc`,
        fontWeight: "bold",
        fontSize: "1.1rem"
      }}
    >
      {children}
    </div>
  );
}

function Body({ children }: { children: ReactNode }) {
  return <div style={{ padding: "1rem", flex: 1 }}>{children}</div>;
}

function Footer({ children }: { children: ReactNode }) {
  const { borderStyle } = useContext(CardContext);
  return (
    <div
      style={{
        padding: "1rem",
        borderTop: borderStyle === "none" ? "none" : `1px ${borderStyle} #ccc`,
        textAlign: "right"
      }}
    >
      {children}
    </div>
  );
}

function Image({ src, alt }: { src: string; alt?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: "100%",
        height: "200px",
        objectFit: "cover"
      }}
    />
  );
}

Card.Header = Header;
Card.Body = Body;
Card.Footer = Footer;
Card.Image = Image;

export { Card };
