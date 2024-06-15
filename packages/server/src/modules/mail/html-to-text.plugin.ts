import { compile, compiledFunction } from "html-to-text";
import { PluginFunction } from "nodemailer/lib/mailer";

let htmlToText: compiledFunction | undefined;

export const htmlToTextPlugin: PluginFunction = (mail, done) => {
  const { raw, text, html } = mail.data;
  if (html === undefined || text !== undefined || raw !== undefined) {
    done();
    return;
  }

  if (htmlToText === undefined) {
    htmlToText = compile({
      decodeEntities: true,
      selectors: [
        { selector: "a", options: { hideLinkHrefIfSameAsText: true } },
        // Remove inlined CID images
        { selector: "img[src^='cid:']", format: "skip" },
      ],
    });
  }

  void mail.resolveContent(mail.data, "html", (error, value) => {
    if (error) {
      done(error);
      return;
    }

    try {
      let html = value as string | Buffer;
      if (html instanceof Buffer) {
        html = html.toString("utf-8");
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mail.data.text = htmlToText!(html);
      done();
    } catch (error) {
      done(error as Error);
    }
  });
};
