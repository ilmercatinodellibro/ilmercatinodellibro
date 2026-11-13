import { ForbiddenException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { rootConfiguration } from "src/config/root.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";

describe("AuthController", () => {
  let controller: AuthController;
  const authService = {
    validateEmailVerificationToken: vi.fn(),
    createAccessToken: vi.fn(),
  };
  const response = { redirect: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
    })
      .useMocker((token) => {
        if (token === AuthService) {
          return authService;
        }
        if (token === rootConfiguration.KEY) {
          return { clientUrl: "https://example.com" };
        }
      })
      .compile();

    controller = moduleRef.get(AuthController);
  });

  it("should verify the email token, then redirect to the login of the location", async () => {
    await controller.validateEmail(
      "mo",
      "the-token",
      response as unknown as Response,
    );

    expect(authService.validateEmailVerificationToken).toHaveBeenCalledWith(
      "the-token",
    );
    expect(response.redirect).toHaveBeenCalledWith(
      "https://example.com/mo/login?emailVerified=true",
    );
  });

  it("should not redirect when the email token is invalid", async () => {
    authService.validateEmailVerificationToken.mockRejectedValue(
      new Error("Invalid token"),
    );

    await expect(
      controller.validateEmail(
        "mo",
        "wrong-token",
        response as unknown as Response,
      ),
    ).rejects.toThrow("Invalid token");
    expect(response.redirect).not.toHaveBeenCalled();
  });

  describe.for(["facebookAuthCallback", "googleAuthCallback"] as const)(
    "%s",
    (callback) => {
      it("should redirect to the social login of the location with an access token", () => {
        authService.createAccessToken.mockReturnValue("the-jwt");

        controller[callback](
          {
            user: { id: "user-id" },
            query: { state: "re" },
          } as unknown as Request,
          response as unknown as Response,
        );

        expect(authService.createAccessToken).toHaveBeenCalledWith("user-id");
        expect(response.redirect).toHaveBeenCalledWith(
          "https://example.com/re/login/social?token=the-jwt",
        );
      });

      it("should refuse the login when the provider authenticated no user", () => {
        expect(() => {
          controller[callback](
            { query: { state: "re" } } as unknown as Request,
            response as unknown as Response,
          );
        }).toThrow(ForbiddenException);
        expect(response.redirect).not.toHaveBeenCalled();
      });
    },
  );
});
