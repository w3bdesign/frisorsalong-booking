module.exports = [
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
      parserOptions: {
        project: require("path").join(__dirname, "tsconfig.json"),
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
      ...require("@typescript-eslint/eslint-plugin").configs["recommended"]
        .rules,
      ...require("@typescript-eslint/eslint-plugin").configs[
        "recommended-requiring-type-checking"
      ].rules,
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-explicit-any": "error",
      // Temporary measure
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      // End temporary
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            arguments: false,
          },
        },
      ],
    },
  },
];
