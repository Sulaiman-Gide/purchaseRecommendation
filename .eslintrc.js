module.exports = {
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    parser: "@typescript-eslint/parser",
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "plugin:react-hooks/recommended",
      "plugin:prettier/recommended", // Enables eslint-plugin-prettier and displays Prettier errors as ESLint errors
    ],
    plugins: ["@typescript-eslint", "react", "react-hooks", "prettier"],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 12,
      sourceType: "module",
    },
    rules: {
      "prettier/prettier": "error", // Display Prettier issues as ESLint errors
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off", // Disable type enforcement on module boundaries
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  };
  