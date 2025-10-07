import React from "react";
interface ModalProps {
    isOpen: boolean;
    openHandler: (newIsOpen: boolean) => void;
    title?: string;
    children?: React.ReactNode;
}
declare const Modal: import("react").ForwardRefExoticComponent<ModalProps & import("react").RefAttributes<HTMLDivElement>>;
export { Modal };
