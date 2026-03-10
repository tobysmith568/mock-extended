/** @type {import('jest').Config} */
module.exports = {
  rootDir: __dirname,
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
      },
    ],
  },
  moduleNameMapper: {
    "^mock-extended$": "<rootDir>/../mock-extended/src/index.ts",
  },
  clearMocks: true,
};
