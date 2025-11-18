#!/usr/bin/env ts-node
import { execSync } from "node:child_process";

const TIMEOUT_MS = 60_000;
const start = Date.now();

async function waitForDocker() {
  while (true) {
    try {
      execSync("docker info > /dev/null 2>&1");
      console.log("✅ Docker daemon is ready");
      process.exit(0);
    } catch {
      const elapsed = Date.now() - start;
      if (elapsed > TIMEOUT_MS) {
        console.error("❌ Timed out waiting for Docker to be ready.");
        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

await waitForDocker();
