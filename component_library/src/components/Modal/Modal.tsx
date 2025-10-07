import React, {
  forwardRef,
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  useCallback
} from "react";
import { createPortal } from "react-dom";
import useOnClickOutside from "../../hooks/useClickoutside";
import { useTracking } from "../../context/TrackingContext";

interface ModalProps {
  isOpen: boolean;
  openHandler: (newIsOpen: boolean) => void;
  title?: string;
  children?: React.ReactNode;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  { isOpen, openHandler, children },
  ref
) {
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);
  const localRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef<boolean>(isOpen);
  const closeReasonRef = useRef<string | null>(null);
  const { track } = useTracking();

  useImperativeHandle(ref, () => localRef.current as HTMLDivElement);

  const closeModal = useCallback(
    (reason: string) => {
      closeReasonRef.current = reason;
      openHandler(false);
    },
    [openHandler]
  );

  const handleClickOutside = () => closeModal("outside-click");
  const handleBackdrop = () => closeModal("backdrop");

  useEffect(() => {
    setModalRoot(document.getElementById("modal"));
  }, []);

  useOnClickOutside(localRef, handleClickOutside);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      track({ componentName: "Modal", action: "open" });
    }

    if (!isOpen && wasOpenRef.current) {
      const reason = closeReasonRef.current ?? "programmatic";
      track({
        componentName: "Modal",
        action: "close",
        metadata: { reason },
      });
      closeReasonRef.current = null;
    }

    wasOpenRef.current = isOpen;
  }, [isOpen, track]);

  if (!isOpen || !modalRoot) return null;

  return createPortal(
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1000
        }}
        onClick={handleBackdrop}
      />
      <div
        ref={localRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: "1rem",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          zIndex: 1001,
          minWidth: "300px"
        }}
      >
        {children}
      </div>
    </>,
    modalRoot
  );
});

export { Modal };
