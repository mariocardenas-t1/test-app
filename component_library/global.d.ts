import "@testing-library/jest-dom";

declare global {
  namespace jest {}
  interface Window {
    __ANALYTICS_API_URL__?: string;
  }
}
