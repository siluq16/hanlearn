import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
// @ts-expect-error Read-only CLI utilities use plain ESM.
import { compareSchema } from "../scripts/verify-schema.mjs";
// @ts-expect-error Read-only CLI utilities use plain ESM.
import { reviewPlatform } from "../scripts/verify-cloud-security.mjs";
// @ts-expect-error Read-only CLI utilities use plain ESM.
import { checkAnonymousApi } from "../scripts/check-anonymous-api.mjs";

const sha = (v: string) => createHash("sha256").update(v).digest("hex");
describe("classification cannot hide function drift", () => {
  const app = {
    arguments: "",
    name: "app",
    owner: "postgres",
    schema: "public",
  };
  const setup = {
    arguments: "",
    name: "setup",
    owner: "postgres",
    schema: "public",
  };
  const expected = {
    sections: { functions: { count: 1, sha256: sha(JSON.stringify([app])) } },
  };
  const classification = {
    applicationFunctionNames: ["public.app"],
    reviewedPreexistingFunctions: [setup],
  };
  it("separately reports a reviewed pre-existing function", () => {
    const result = compareSchema(
      expected,
      { functions: [app, setup] },
      classification,
    );
    expect(result.status).toBe("PASS");
    expect(result.preexistingObjects[0].classification).toBe(
      "REVIEWED_PREEXISTING",
    );
  });
  it("fails for an unclassified extra even when all app functions match", () => {
    expect(
      compareSchema(
        expected,
        { functions: [app, setup, { ...setup, name: "surprise" }] },
        classification,
      ).status,
    ).toBe("FAIL");
  });
  it("fails on changed metadata of an already classified function", () => {
    expect(
      compareSchema(
        expected,
        { functions: [app, { ...setup, owner: "anon" }] },
        classification,
      ).status,
    ).toBe("FAIL");
  });
  it("does not hide unexpected application overloads", () => {
    expect(
      compareSchema(
        expected,
        { functions: [app, { ...app, arguments: "text" }, setup] },
        classification,
      ).status,
    ).toBe("FAIL");
  });
  it("fails for a missing app function", () => {
    expect(
      compareSchema(expected, { functions: [setup] }, classification).status,
    ).toBe("FAIL");
  });
  it("detects a missing reviewed platform object in the schema snapshot", () => {
    expect(
      compareSchema(expected, { functions: [app] }, classification).status,
    ).toBe("FAIL");
  });
});

describe("reviewed platform body and wiring", () => {
  const body = "begin null; end;";
  const definition = "test fixture definition";
  const metadata = { schema: "public", name: "rls_auto_enable", arguments: "" };
  const actual = {
    functions: [{ ...metadata, body, definition }],
    event_triggers: [{ name: "ensure_rls", enabled: "O" }],
    schema_privileges: [{ create: false }],
    role_flags: [{ superuser: false }],
  };
  const reviewed = {
    functionMetadata: metadata,
    functionBodySha256: sha(body),
    functionDefinitionSha256: sha(definition),
    eventTriggers: actual.event_triggers,
    schemaPrivileges: actual.schema_privileges,
    roleFlags: actual.role_flags,
  };
  const baseline = [
    {
      schema: "public",
      name: "rls_auto_enable",
      signature: "",
      security_definer: true,
      search_path: "search_path=pg_catalog",
    },
  ];
  it("accepts exact reviewed body/metadata/wiring with baseline evidence", () => {
    expect(reviewPlatform(actual, reviewed, baseline).status).toBe("PASS");
  });
  it("rejects changed function body", () => {
    expect(
      reviewPlatform(
        {
          ...actual,
          functions: [{ ...actual.functions[0], body: "unexpected body" }],
        },
        reviewed,
        baseline,
      ).status,
    ).toBe("FAIL");
  });
  it("rejects disabled or new event triggers", () => {
    expect(
      reviewPlatform(
        { ...actual, event_triggers: [{ name: "ensure_rls", enabled: "D" }] },
        reviewed,
        baseline,
      ).status,
    ).toBe("FAIL");
    expect(
      reviewPlatform(
        {
          ...actual,
          event_triggers: [...actual.event_triggers, { name: "unknown" }],
        },
        reviewed,
        baseline,
      ).status,
    ).toBe("FAIL");
  });
  it("requires proof of pre-migration existence", () => {
    expect(reviewPlatform(actual, reviewed, []).status).toBe("FAIL");
  });
  it("rejects a new schema CREATE grant or RLS bypass", () => {
    expect(
      reviewPlatform(
        { ...actual, schema_privileges: [{ create: true }] },
        reviewed,
        baseline,
      ).status,
    ).toBe("FAIL");
    expect(
      reviewPlatform(
        { ...actual, role_flags: [{ superuser: true }] },
        reviewed,
        baseline,
      ).status,
    ).toBe("FAIL");
  });
});

describe("anonymous GET-only HTTP probes", () => {
  const relations = [{ schema: "public", name: "profiles" }];
  const fetchDenied = async (_url: URL, init: RequestInit) => {
    expect(init.method).toBe("GET");
    expect(init.redirect).toBe("error");
    expect(init.headers).not.toHaveProperty("Authorization");
    const isPrivate =
      (init.headers as Record<string, string>)["Accept-Profile"] === "private";
    if (_url.pathname.endsWith("/rls_auto_enable")) {
      return {
        status: 400,
        json: async () => ({
          code: "0A000",
          message: "cannot display a value of type event_trigger",
        }),
      };
    }
    return {
      status: isPrivate ? 406 : 401,
      json: async () => ({ code: isPrivate ? "PGRST106" : "42501" }),
    };
  };
  it("accepts explicit schema rejection and SQL permission denial", async () => {
    const result = await checkAnonymousApi(
      fetchDenied,
      "https://example.test",
      "public-test-key",
      relations,
    );
    expect(result.status).toBe("PASS");
    expect(result.checks).toHaveLength(8);
  });
  it("rejects successful reads even when the response is empty", async () => {
    const result = await checkAnonymousApi(
      async () => ({ status: 200, json: async () => [] }),
      "https://example.test",
      "public-test-key",
      relations,
    );
    expect(result.status).toBe("FAIL");
  });
  it("does not accept an unrelated unsupported-feature error", async () => {
    const result = await checkAnonymousApi(
      async () => ({
        status: 400,
        json: async () => ({ code: "0A000", message: "unclassified failure" }),
      }),
      "https://example.test",
      "public-test-key",
      relations,
    );
    expect(result.status).toBe("FAIL");
    expect(result.checks[0].triggerRpcRejected).toBe(false);
  });
  it("does not treat a missing table/RPC as proof of denied access", async () => {
    const result = await checkAnonymousApi(
      async () => ({ status: 404, json: async () => ({ code: "PGRST202" }) }),
      "https://example.test",
      "public-test-key",
      relations,
    );
    expect(result.status).toBe("FAIL");
  });
  it("reports network failure as blocked without raw diagnostics", async () => {
    const result = await checkAnonymousApi(
      async () => {
        throw Error("sensitive diagnostics");
      },
      "https://example.test",
      "public-test-key",
      relations,
    );
    expect(result.status).toBe("BLOCKED");
    expect(JSON.stringify(result)).not.toContain("sensitive diagnostics");
  });
  it("read-only helper contains no migration write execution path", () => {
    const helper = readFileSync("scripts/cloud-security-verify.ps1", "utf8");
    expect(helper).toContain("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    expect(helper).toContain("ON_ERROR_STOP=1");
    expect(helper).toContain("default_transaction_read_only=on");
    expect(helper).not.toMatch(
      /MigrationWrite|db.?push|applyGate|migration.?repair/i,
    );
  });
});
