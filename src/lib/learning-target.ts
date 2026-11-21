export const DEVELOPMENT_PROJECT_REF = "hhgxrjqkuwdgurphopok";

// Pure target check shared by server-rendered controls and Server Actions.
// Flags never authorize an unapproved Cloud project; Production requires explicit server-only opt-in.
export function learningTarget(
  url: string | undefined,
  localEnabled: string | undefined,
  developmentEnabled?: string,
  deployment?: string,
  productionEnabled?: string,
) {
  if (!url) return false;
  try {
    const target = new URL(url);
    if (
      target.protocol !== "https:" ||
      target.username ||
      target.password ||
      target.search ||
      target.hash ||
      target.pathname !== "/"
    )
      return false;
    const isPinnedSupabase =
      target.origin === `https://${DEVELOPMENT_PROJECT_REF}.supabase.co`;
    if (deployment === "production") {
      return productionEnabled === "1" && isPinnedSupabase;
    }
    if (
      localEnabled === "1" &&
      ["127.0.0.1", "[::1]"].includes(target.hostname)
    )
      return true;
    return developmentEnabled === "1" && isPinnedSupabase;
  } catch {
    return false;
  }
}
