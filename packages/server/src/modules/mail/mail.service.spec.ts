import { Test } from "@nestjs/testing";
import { MailerService } from "@nestjs-modules/mailer";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { rootConfiguration } from "src/config/root.js";
import { MailService } from "./mail.service.js";

describe("MailService", () => {
  let mailService: MailService;
  const sendMail = vi.fn();

  beforeEach(async () => {
    sendMail.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [MailService],
    })
      .useMocker((token) => {
        if (token === MailerService) {
          return { sendMail };
        }
        if (token === rootConfiguration.KEY) {
          return { clientUrl: "https://example.com" };
        }
      })
      .compile();

    mailService = moduleRef.get(MailService);
  });

  it("should convert recipients into address objects", async () => {
    await mailService.sendMail({
      to: [
        "Mario Rossi <mario@example.com>",
        "anna@example.com",
        { email: "luca@example.com", firstname: "Luca", lastname: "Verdi" },
      ],
      subject: "Welcome",
      template: "welcome",
      locale: "en-US",
      retailLocationId: "mo",
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: [
          { name: "Mario Rossi", address: "mario@example.com" },
          { name: "anna@example.com", address: "anna@example.com" },
          { name: "Luca Verdi", address: "luca@example.com" },
        ],
      }),
    );
  });

  it("should prefix the subject and pick the template of the locale", async () => {
    await mailService.sendMail({
      to: "mario@example.com",
      subject: "Welcome",
      template: "welcome",
      locale: "en-US",
      retailLocationId: "mo",
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Il Mercatino del Libro - Welcome",
        template: "en-US/welcome",
      }),
    );
  });

  it("should fall back to Italian when the user has no locale", async () => {
    await mailService.sendMail({
      to: "mario@example.com",
      subject: "Welcome",
      template: "welcome",
      locale: null,
      retailLocationId: "mo",
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ locale: "it", template: "it/welcome" }),
    );
  });

  it("should link the terms of the retail location and the privacy policy in the locale", async () => {
    await mailService.sendMail({
      to: "mario@example.com",
      subject: "Welcome",
      template: "welcome",
      locale: "en-US",
      retailLocationId: "re",
      context: { name: "Mario" },
    });

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        context: {
          privacyPolicyUrl:
            "https://example.com/tos-privacy/privacy-policy-en-US.pdf",
          tosUrl: "https://example.com/tos-privacy/tos-re-en-US.pdf",
          name: "Mario",
        },
      }),
    );
  });
});
