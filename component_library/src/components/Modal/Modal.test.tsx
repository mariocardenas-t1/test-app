import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "./Modal";

const trackMock = jest.fn();
jest.mock("../../context/TrackingContext", () => ({
  useTracking: () => ({
    track: trackMock,
  }),
}));

jest.mock("../../hooks/useClickoutside", () => ({
  __esModule: true,
  default: (ref: any, handler: () => void) => {}
}));

describe("Modal component", () => {
  let modalRoot: HTMLElement;

  beforeEach(() => {
    trackMock.mockClear();
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal");
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    document.body.removeChild(modalRoot);
  });

  it("does not render when isOpen=false", () => {
    render(
      <Modal isOpen={false} openHandler={jest.fn()}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByText("Modal content")).not.toBeInTheDocument();
  });

  it("renders children when isOpen=true", () => {
    render(
      <Modal isOpen={true} openHandler={jest.fn()}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("renders into the #modal portal root", () => {
    render(
      <Modal isOpen={true} openHandler={jest.fn()}>
        <div>Inside Portal</div>
      </Modal>
    );

    const portalContent = modalRoot.querySelector("div");
    expect(portalContent).toBeTruthy();
    expect(screen.getByText("Inside Portal")).toBeInTheDocument();
  });

  it("calls openHandler(false) when clicking backdrop", () => {
    const handler = jest.fn();

    render(
      <Modal isOpen={true} openHandler={handler}>
        <div>Modal content</div>
      </Modal>
    );

    const backdrop = modalRoot.querySelector("div"); // first div is backdrop
    fireEvent.click(backdrop!);

    expect(handler).toHaveBeenCalledWith(false);
  });

  it("does not close when clicking inside modal content", () => {
    const handler = jest.fn();

    render(
      <Modal isOpen={true} openHandler={handler}>
        <div>Inside Modal</div>
      </Modal>
    );

    const modalContent = screen.getByText("Inside Modal");
    fireEvent.click(modalContent);

    expect(handler).not.toHaveBeenCalled();
  });
});
