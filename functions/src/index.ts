import { onRequest } from "firebase-functions/v2/https";
import * as path from "path";

// The Next.js standalone server entry point
// We will copy this file into the functions directory during the build/deploy step
const nextServerPath = path.join(__dirname, "../next/server.js");

export const server = onRequest({
  memory: "1GiB",
  timeoutSeconds: 60,
  region: "us-central1", // Adjust to your preferred region
  minInstances: 0,
  secrets: ["GROQ_API_KEY", "OPENROUTER_API_KEY"],
}, (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nextServer = require(nextServerPath);
  return nextServer.handler(req, res);
});
