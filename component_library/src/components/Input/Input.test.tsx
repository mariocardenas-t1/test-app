// Input.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Input } from "./Input";

const trackMock = jest.fn();
jest.mock("../../context/TrackingContext", () => ({
  useTracking: () => ({
    track: trackMock,
  }),
}));

describe("<Input />", () => {
  beforeEach(() => {
    trackMock.mockClear();
  });

  it("renders with a label", () => {
    render(<Input label="Username" name="username" state="default" />);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("renders input inside label and associates correctly", () => {
    render(
      <Input label="Email" name="email" id="email-input" state="default" />
    );
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("id", "email-input");
    expect(input).toHaveAttribute("name", "email");
  });

  it("applies default state border color", () => {
    render(<Input name="default" state="default" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveStyle({ border: "2px solid #ccc" });
  });

  it("applies error state border color", () => {
    render(<Input name="error" state="error" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveStyle({ border: "2px solid #ff0000" });
  });

  it("applies success state border color", () => {
    render(<Input name="success" state="success" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveStyle({ border: "2px solid #008d00ff" });
  });

  it("accepts user input", () => {
    render(<Input name="password" state="default" />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "secret" } });
    expect(input.value).toBe("secret");
  });

  it("forwards ref to the input element", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input name="ref-test" state="default" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    ref.current!.focus();
    expect(document.activeElement).toBe(ref.current);
  });

  it("spreads extra props onto the input", () => {
    render(
      <Input
        name="extra"
        state="default"
        placeholder="Enter text"
        data-testid="custom-input"
        aria-label="Custom Input"
      />
    );
    const input = screen.getByTestId("custom-input");
    expect(input).toHaveAttribute("placeholder", "Enter text");
    expect(input).toHaveAttribute("aria-label", "Custom Input");
  });

  it("renders without label if not provided", () => {
    render(<Input name="no-label" state="default" />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs[0]).toBeInTheDocument();
  });
});
