import serverless from "serverless-http";
import { createApp } from "../../src/app.js";

/**
 * Netlify Function that serves the whole Express API.
 * netlify.toml rewrites every request to this function; `basePath`
 * strips the function prefix so Express sees the original path.
 */
export const handler = serverless(createApp(), {
  basePath: "/.netlify/functions/api",
});
