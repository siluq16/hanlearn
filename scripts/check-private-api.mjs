// GET-only exposure check. No Auth accounts, mutations or secret keys.
import fs from "node:fs";
import { parseEnv } from "node:util";
const config = parseEnv(fs.readFileSync(".env.local", "utf8"));
const url = config.NEXT_PUBLIC_SUPABASE_URL;
const key = config.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const result = {
  projectRef: "hhgxrjqkuwdgurphopok",
  status: "BLOCKED",
  privateSchemaExcluded: false,
};
try {
  if (
    new URL(url).hostname !== "hhgxrjqkuwdgurphopok.supabase.co" ||
    !key?.startsWith("sb_publishable_")
  )
    throw Error();
  const response = await fetch(
    new URL("/rest/v1/quiz_answer_keys?select=question_id&limit=0", url),
    {
      method: "GET",
      headers: { apikey: key, "Accept-Profile": "private" },
      signal: AbortSignal.timeout(20000),
    },
  );
  const body = await response.json();
  result.httpStatus = response.status;
  result.errorCode = typeof body?.code === "string" ? body.code : null;
  result.privateSchemaExcluded =
    response.status === 406 && body?.code === "PGRST106";
  result.status = result.privateSchemaExcluded ? "PASS" : "FAIL";
} catch {
  result.reason =
    "Data API verification unavailable; response/credentials suppressed.";
}
fs.mkdirSync(".local/cloud-apply", { recursive: true });
fs.writeFileSync(
  ".local/cloud-apply/private-api.json",
  JSON.stringify(result, null, 2) + "\n",
);
console.log(JSON.stringify(result));
if (result.status !== "PASS") process.exitCode = 2;
