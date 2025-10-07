import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  rootDir: ".",
  setupFilesAfterEnv: ["@testing-library/jest-dom"]
};
export default config;
