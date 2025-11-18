#!/usr/bin/env ts-node
import { execSync } from "node:child_process";

// Start Docker Desktop on macOS; noop elsewhere
try {
  if (process.platform === "darwin") {
    console.log("▶️  Starting Docker Desktop...");
    execSync("open -g -a Docker", { stdio: "ignore" });
  } else {
    console.log(
      "▶️  Non-macOS platform — assuming Docker is already managed by OS/WSL.",
    );
  }

  process.exit(0);
} catch (err) {
  const error = err instanceof Error ? err.message : String(err);
  console.error("❌ Failed to start Docker Desktop:", error);
  process.exit(1);
}
