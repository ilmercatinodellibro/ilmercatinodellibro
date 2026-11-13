import { gzipSync } from "node:zlib";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/create-app.js";

describe("App (e2e)", () => {
  let app: NestExpressApplication;
  let baseUrl: string;

  beforeAll(async () => {
    app = await createApp();
    // Port 0 lets the OS pick a free port
    await app.listen(0);
    baseUrl = await app.getUrl();
  });

  afterAll(async () => {
    await app.close();
  });

  // The SPA fallback answers every GET route it does not exclude
  it("should answer GraphQL queries sent with GET", async () => {
    const response = await fetch(`${baseUrl}/graphql?query={__typename}`, {
      headers: { "apollo-require-preflight": "true" },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { __typename: "Query" } });
  });

  it("should refuse compressed request bodies", async () => {
    const response = await fetch(`${baseUrl}/graphql`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-encoding": "gzip",
      },
      body: gzipSync(JSON.stringify({ query: "{__typename}" })),
    });

    expect(response.status).toBe(415);
  });

  it("should still accept uncompressed request bodies", async () => {
    const response = await fetch(`${baseUrl}/graphql`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: "{__typename}" }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { __typename: "Query" } });
  });
});
