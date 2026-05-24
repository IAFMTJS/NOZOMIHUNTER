import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: [
      {
        find: /^@\/contracts\/(.*)$/,
        replacement: `${path.resolve(__dirname, "./contracts")}/$1`,
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
})
