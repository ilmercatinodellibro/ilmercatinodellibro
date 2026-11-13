import * as z from "zod/mini";

// Unlike zod, zod/mini loads no locale, so every error would only say "Invalid input"
z.config(z.locales.en());

export * as z from "zod/mini";
