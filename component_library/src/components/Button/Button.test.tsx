// Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";
import React from "react";

// Mock Spinner to simplify tests
jest.mock("../../animations/Spinner", () => () => (
  <div data-testid="spinner">Loading...</div>
));

const trackMock = jest.fn();
jest.mock("../../context/TrackingContext", () => ({
  useTracking: () => ({
    track: trackMock,
  }),
}));

describe("<Button />", () => {
  beforeEach(() => {
    trackMock.mockClear();
  });

  it("renders children correctly", () => {
    render(
      <Button label="Fallback label" onClick={() => {}}>
        Child content
      </Button>
    );
    expect(screen.getByRole("button")).toHaveTextContent("Child content");
  });

  it("renders label when children are not provided", () => {
    render(<Button label="My Label" onClick={() => {}} />);
    expect(screen.getByRole("button")).toHaveTextContent("My Label");
  });

  it("renders an icon when provided", () => {
    render(
      <Button
        label="With Icon"
        onClick={() => {}}
        icon={<span data-testid="icon">⭐</span>}
      >
        Button
      </Button>
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders Spinner when loading and disables button", () => {
    render(<Button label="Loading" onClick={() => {}} loading />);
    const button = screen.getByRole("button");
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(
      <Button label="Click me" onClick={handleClick}>
        Button
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const handleClick = jest.fn();
    render(
      <Button label="Disabled" onClick={handleClick} disabled>
        Button
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("does not call onClick when loading", () => {
    const handleClick = jest.fn();
    render(
      <Button label="Loading" onClick={handleClick} loading>
        Button
      </Button>
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies correct variant background color", () => {
    const { rerender } = render(
      <Button label="Primary" onClick={() => {}} variant="primary" />
    );
    let button = screen.getByRole("button");
    expect(button).toHaveStyle({ backgroundColor: "#007bff" });

    rerender(
      <Button label="Secondary" onClick={() => {}} variant="secondary" />
    );
    button = screen.getByRole("button");
    expect(button).toHaveStyle({ backgroundColor: "#6c757d" });

    rerender(<Button label="Danger" onClick={() => {}} variant="danger" />);
    button = screen.getByRole("button");
    expect(button).toHaveStyle({ backgroundColor: "#dc3545" });
  });

  it("forwards ref to the button element", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button label="Ref test" onClick={() => {}} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    ref.current!.focus();
    expect(document.activeElement).toBe(ref.current);
  });

  it("spreads extra props onto button", () => {
    render(
      <Button
        label="Extra props"
        onClick={() => {}}
        data-testid="custom-btn"
        aria-label="Custom Button"
      />
    );
    const btn = screen.getByTestId("custom-btn");
    expect(btn).toHaveAttribute("aria-label", "Custom Button");
  });
});
