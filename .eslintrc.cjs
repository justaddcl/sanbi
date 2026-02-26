/** @type {import("eslint").Linter.Config} */
const config = {
  ignorePatterns: ["src/scripts/pino-pretty.mjs"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: [
    "@typescript-eslint",
    "drizzle",
    "deprecation",
    "simple-import-sort",
  ],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:@tanstack/query/recommended",
  ],
  rules: {
    // warn when using code marked as @deprecated
    "deprecation/deprecation": "warn",
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
    "@typescript-eslint/ban-ts-comment": [
      "warn",
      {
        "ts-expect-error": "allow-with-description",
      },
    ],
    "drizzle/enforce-delete-with-where": [
      "error",
      {
        drizzleObjectName: ["db", "ctx.db"],
      },
    ],
    "drizzle/enforce-update-with-where": [
      "error",
      {
        drizzleObjectName: ["db", "ctx.db"],
      },
    ],
    // Import sorting rules
    "simple-import-sort/imports": [
      "warn",
      {
        groups: [
          // 0. server-only
          ["^\\u0000server-only$"],
          // 1. React, Next.js and external packages (excluding internal aliases)
          [
            "^react",
            "^next",
            "^(?!@components|@modules|@lib|@server|@app|@/)@?\\w",
          ],

          // 2. Internal aliases with sub-groups
          // 2a. ShadCN UI components
          [
            "^@components/ui",

            // 2b. custom components
            "^@components",

            // 2c. Feature module imports
            "^@modules",

            // 2d. Utility/library imports
            "^@lib",

            // 2e. Server-related imports
            "^@server",

            // 2f. App-related imports
            "^@app",

            // 2g. Other root-level internal imports
            "^@/",
          ],

          // 3. Relative imports
          [
            "^\\./(?!.*\\.css$)",
            "^\\.(?!/?$)",
            "^\\.\\.(?!/?$)",
            "^\\.\\./(?!.*\\.css$)",
          ],

          // 4. Style imports
          ["^.+\\.css$"],
        ],
      },
    ],
    "simple-import-sort/exports": "warn",
    "import/first": "warn",
    "import/newline-after-import": "warn",
    "import/no-duplicates": "warn",
  },
};
module.exports = config;
