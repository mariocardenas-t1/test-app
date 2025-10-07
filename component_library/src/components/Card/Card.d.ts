import { ReactNode } from "react";
interface CardProps {
    children: ReactNode;
    borderStyle?: "solid" | "dashed" | "none";
}
declare function Card({ children, borderStyle }: CardProps): import("react/jsx-runtime").JSX.Element;
declare namespace Card {
    var Header: ({ children }: {
        children: ReactNode;
    }) => import("react/jsx-runtime").JSX.Element;
    var Body: ({ children }: {
        children: ReactNode;
    }) => import("react/jsx-runtime").JSX.Element;
    var Footer: ({ children }: {
        children: ReactNode;
    }) => import("react/jsx-runtime").JSX.Element;
    var Image: ({ src, alt }: {
        src: string;
        alt?: string | undefined;
    }) => import("react/jsx-runtime").JSX.Element;
}
export { Card };
