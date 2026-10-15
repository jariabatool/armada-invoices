import serverless from "serverless-http";
import { createApp } from "../../src/app.js";

/**
 * Netlify Function (v2) that serves the whole Express API.
 * Netlify passes a Web `Request`; we hand it to Express through serverless-http
 * (which speaks the Lambda event format) and turn the result back into a `Response`.
 */
const expressHandler = serverless(createApp());

interface LambdaResult {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams);
  const multiValueQuery: Record<string, string[]> = {};
  for (const key of url.searchParams.keys()) multiValueQuery[key] = url.searchParams.getAll(key);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const result = (await expressHandler(
    {
      httpMethod: request.method,
      path: url.pathname,
      headers: Object.fromEntries(request.headers),
      queryStringParameters: Object.keys(query).length ? query : null,
      multiValueQueryStringParameters: Object.keys(multiValueQuery).length ? multiValueQuery : null,
      body: hasBody ? await request.text() : null,
      isBase64Encoded: false,
      requestContext: {},
    },
    {},
  )) as LambdaResult;

  const body = result.isBase64Encoded ? Buffer.from(result.body, "base64") : result.body;
  return new Response(result.statusCode === 204 ? null : body, {
    status: result.statusCode,
    headers: result.headers ?? {},
  });
}

/** Route every path on this site to the API. */
export const config = {
  path: "/*",
};
