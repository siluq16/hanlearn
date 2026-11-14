// Routine Development reads reuse the dedicated encrypted test session.
// No approval environment variables, signature files or write probes.
process.argv.push("--read-only");
await import("./test-development-learning.mjs");
