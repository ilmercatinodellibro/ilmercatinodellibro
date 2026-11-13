/** The target of the first link in the email body */
export function extractLink(email: string) {
  const link = /href="([^"]*)"/.exec(email)?.[1];
  if (!link) {
    throw new Error("The email does not contain a link");
  }

  // The link sits in an HTML attribute, where the ampersands are escaped
  return link.replaceAll("&amp;", "&");
}
