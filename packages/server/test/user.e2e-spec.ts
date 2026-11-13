import type { NestExpressApplication } from "@nestjs/platform-express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { User } from "../src/@generated/prisma/client.js";
import { createApp } from "../src/create-app.js";
import { PrismaService } from "../src/modules/prisma/prisma.service.js";
import { RE_RETAIL_POINT } from "./fixtures/retail-locations.js";
import { DEFAULT_PASSWORD, TEST_ADMIN } from "./fixtures/users.js";

describe("Users (e2e)", () => {
  let app: NestExpressApplication;
  let baseUrl: string;
  let prisma: PrismaService;
  let jwt: string;
  let admin: User;

  async function graphql(query: string, variables?: Record<string, unknown>) {
    const response = await fetch(`${baseUrl}/graphql`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(jwt ? { authorization: `Bearer ${jwt}` } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });
    return (await response.json()) as {
      data?: Record<string, unknown>;
      errors?: unknown[];
    };
  }

  beforeAll(async () => {
    app = await createApp();
    // Port 0 lets the OS pick a free port
    await app.listen(0);
    baseUrl = await app.getUrl();
    prisma = app.get(PrismaService);

    const { data } = await graphql(
      "mutation ($input: LoginPayload!) { login(input: $input) { jwt } }",
      { input: { email: TEST_ADMIN.email, password: DEFAULT_PASSWORD } },
    );
    ({ jwt } = (data as { login: { jwt: string } }).login);

    admin = await prisma.user.findUniqueOrThrow({
      where: { email: TEST_ADMIN.email },
    });
  });

  afterAll(async () => {
    const { phoneNumber, notes, discount, locale } = admin;
    await prisma.user.update({
      where: { id: admin.id },
      data: { phoneNumber, notes, discount, locale },
    });
    await app.close();
  });

  it("should keep the fields an update leaves out", async () => {
    // An admin, since only admins can change the discount
    await prisma.user.update({
      where: { id: admin.id },
      data: {
        phoneNumber: "+390000000000",
        notes: "Some notes",
        discount: true,
        locale: "it",
      },
    });

    // What the client sends when the user switches language
    const result = await graphql(
      "mutation ($input: UpdateUserPayload!) { updateUser(input: $input) { phoneNumber notes discount locale } }",
      {
        input: {
          id: admin.id,
          retailLocationId: RE_RETAIL_POINT.id,
          locale: "en-US",
        },
      },
    );

    expect(result).toEqual({
      data: {
        updateUser: {
          phoneNumber: "+390000000000",
          notes: "Some notes",
          discount: true,
          locale: "en-US",
        },
      },
    });
  });
});
