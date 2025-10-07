import { forwardRef, useCallback } from "react";
import type {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
} from "react";
import { useTracking } from "../../context/TrackingContext";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  state: "default" | "error" | "success";
  label?: string;
}

const stateVariants = {
  default: "#ccc",
  error: "#ff0000",
  success: "#008d00ff"
};

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, state, onFocus, onBlur, onChange, ...props }: InputProps,
  ref
) {
  const { track } = useTracking();

  const emitEvent = useCallback(
    (
      action: "focus" | "blur" | "change",
      event: FocusEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement>
    ) => {
      track({
        componentName: "Input",
        action,
        variant: state,
        metadata: {
          name: props.name,
          label,
          valueLength: event.currentTarget.value.length,
        },
      });
    },
    [label, props.name, state, track]
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      emitEvent("focus", event);
      onFocus?.(event);
    },
    [emitEvent, onFocus]
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      emitEvent("blur", event);
      onBlur?.(event);
    },
    [emitEvent, onBlur]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      emitEvent("change", event);
      onChange?.(event);
    },
    [emitEvent, onChange]
  );

  return (
    <label
      htmlFor={props.name}
      style={{
        marginBottom: "0.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem"
      }}
    >
      {label}
      <input
        {...props}
        id={props.id}
        ref={ref}
        name={props.name}
        style={{
          border: `2px solid ${stateVariants[state] || stateVariants.default}`,
          padding: "0.5rem",
          borderRadius: "4px"
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
      />
    </label>
  );
});

export { Input };
