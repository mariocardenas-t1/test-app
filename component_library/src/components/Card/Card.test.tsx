// Card.test.tsx
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

const trackMock = jest.fn();
jest.mock("../../context/TrackingContext", () => ({
  useTracking: () => ({
    track: trackMock,
  }),
}));

describe("Card component", () => {
  beforeEach(() => {
    trackMock.mockClear();
  });

  it("renders children", () => {
    render(
      <Card>
        <div data-testid="child">Hello</div>
      </Card>
    );
    expect(screen.getByTestId("child")).toHaveTextContent("Hello");
  });

  it("applies no border", () => {
    render(<Card borderStyle="none">content</Card>);
    const card = screen.getByText("content").parentElement;
    expect(card).toHaveStyle("border: none");
  });

  it("renders Header with proper border", () => {
    render(
      <Card borderStyle="dashed">
        <Card.Header>Title</Card.Header>
      </Card>
    );
    const header = screen.getByText("Title");
    expect(header).toBeInTheDocument();
    expect(header).toHaveStyle("border-bottom: 1px dashed #ccc");
  });

  it("renders Body", () => {
    render(
      <Card>
        <Card.Body>Body content</Card.Body>
      </Card>
    );
    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("renders Footer with proper border", () => {
    render(
      <Card borderStyle="solid">
        <Card.Footer>Footer content</Card.Footer>
      </Card>
    );
    const footer = screen.getByText("Footer content");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveStyle("border-top: 1px solid #ccc");
  });

  it("renders Image with src and alt", () => {
    render(
      <Card>
        <Card.Image src="https://placekitten.com/400/200" alt="Kitten" />
      </Card>
    );
    const img = screen.getByAltText("Kitten") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe("https://placekitten.com/400/200");
  });

  it("Header and Footer have no border when borderStyle is none", () => {
    render(
      <Card borderStyle="none">
        <Card.Header>No Border Header</Card.Header>
        <Card.Footer>No Border Footer</Card.Footer>
      </Card>
    );
    expect(screen.getByText("No Border Header")).toHaveStyle(
      "border-bottom: none"
    );
    expect(screen.getByText("No Border Footer")).toHaveStyle(
      "border-top: none"
    );
  });
});
