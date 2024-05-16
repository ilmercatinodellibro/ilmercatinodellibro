interface Language {
  code: string;
  label: string;
}

export const languages = [
  {
    code: "en-US" as const,
    label: "English",
  },
  {
    code: "it" as const,
    label: "Italiano",
  },
] satisfies Language[];
