import { forwardRef, useCallback } from "react";
import type {
  ButtonHTMLAttributes,
  ReactNode,
  MouseEvent,
  FocusEvent,
} from "react";
import Spinner from "../../animations/Spinner";
import { useTracking } from "../../context/TrackingContext";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  children?: ReactNode;
  icon?: ReactNode;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
}
const variants = {
  primary: "#007bff",
  secondary: "#6c757d",
  danger: "#dc3545"
};
const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    loading,
    icon,
    onClick,
    onMouseEnter,
    onFocus,
    variant = "primary",
    disabled,
    label,
    ...rest
  }: ButtonProps,
  ref
) {
  const { track } = useTracking();

  const resolvedLabel =
    label ?? (typeof children === "string" ? (children as string) : undefined);

  const emitEvent = useCallback(
    (action: "click" | "hover" | "focus") => {
      if (disabled || loading) return;
      track({
        componentName: "Button",
        action,
        variant,
        metadata: {
          label: resolvedLabel,
          hasIcon: Boolean(icon),
          disabled: Boolean(disabled),
        },
      });
    },
    [disabled, loading, track, variant, resolvedLabel, icon]
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      emitEvent("click");
      onClick?.(event);
    },
    [emitEvent, onClick]
  );

  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      emitEvent("hover");
      onMouseEnter?.(event);
    },
    [emitEvent, onMouseEnter]
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLButtonElement>) => {
      emitEvent("focus");
      onFocus?.(event);
    },
    [emitEvent, onFocus]
  );

  return (
    <button
      style={{
        padding: "0.5rem 1rem",
        border: "none",
        borderRadius: "4px",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        fontSize: "1rem",
        fontWeight: 500,
        transition: "background-color 0.3s ease",
        backgroundColor: variants[variant],
        color: "white"
      }}
      {...rest}
      data-variant={variant}
      disabled={loading || disabled}
      ref={ref}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus as never}
    >
      {icon}
      {loading ? <Spinner /> : children || label}
    </button>
  );
});

export { Button };
