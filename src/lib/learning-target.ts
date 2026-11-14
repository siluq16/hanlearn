export const DEVELOPMENT_PROJECT_REF = "hhgxrjqkuwdgurphopok";

// Pure target check shared by server-rendered controls and Server Actions.
// Flags never authorize a different Cloud project or a production deployment.
export function learningTarget(
  url: string | undefined,
  localEnabled: string | undefined,
  developmentEnabled?: string,
  deployment?: string,
) {
  if (!url || deployment === "production") return false;
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
    if (
      localEnabled === "1" &&
      ["127.0.0.1", "[::1]"].includes(target.hostname)
    )
      return true;
    return (
      developmentEnabled === "1" &&
      target.origin === `https://${DEVELOPMENT_PROJECT_REF}.supabase.co`
    );
  } catch {
    return false;
  }
}
