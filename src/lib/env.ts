import { z } from "zod";

const publicConfigSchema = z.object({
  url: z.url().refine((value) => {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      url.pathname === "/"
    );
  }),
  publishableKey: z.string().regex(/^sb_publishable_[A-Za-z0-9_-]+$/),
});

export type PublicConfig = z.infer<typeof publicConfigSchema>;
export function parsePublicConfig(input: {
  url?: string;
  publishableKey?: string;
}): PublicConfig | null {
  const result = publicConfigSchema.safeParse(input);
  return result.success ? result.data : null;
}
export function getPublicConfig() {
  return parsePublicConfig({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
