# HSK 1 Pilot r3 — local real-key read verification

2026-11-13. **AUTHORIZATION_PENDING. Real-key read-only validation: BLOCKED.** The owner authorized the action in chat, subject to a separately completed local authorization record with actual name, date/time and confirmation/signature. That record is currently missing. The private answer store was not opened, parsed, hashed or validated in this task.

## Scope and authorization gate

- Action: `READ_VALIDATE_REAL_KEYS_LOCAL_NO_DB` only.
- Package: `hanlearn-pilot-hsk1-v1`, frozen draft revision 3; exact manifest and public snapshot hashes match the owner's authorized values.
- Expected private records: 24; expected quiz revisions: 3/2/2/2. These private bindings have **not** been verified by this run.
- Trusted reader: `readApprovedRealStore()` in `scripts/protected-local-keys.mjs`; existing operator CLI is `node --experimental-strip-types scripts/protected-local-keys.mjs --validate-approved-real`.
- The reader requires a native interactive Windows terminal, approved local record, restricted ACL/no reparse, public audit and private structural/binding validation. It returns only an opaque count/mode handle. The database delivery function rejects real handles unconditionally; it was not invoked.

Readiness/final-gates documents and the reader/authorization-template implementation were inspected before any attempted private read. No reader invocation was made while the signed authorization was missing; the chat instruction does not substitute for the required local record.

## Local checks performed before the gate

| Check                                                     | Result                                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Public r3 manifest and snapshot/hash audit                | PASS; authorized frozen package matches                                                           |
| Active authorization record                               | AUTHORIZATION_PENDING: `.local/pilot-hsk1/v1/authorizations/real-key-read-r3.json` does not exist |
| Existing inactive authorization template                  | Present; not activated, signed or modified by agent                                               |
| Authorization and answer-store paths Git ignored          | PASS                                                                                              |
| Files tracked under private-store/authorization paths     | PASS: 0 tracked paths                                                                             |
| Authorization directory ACL                               | PASS: owner/SYSTEM only, directory inheritance protected                                          |
| Template effective ACL                                    | PASS: owner/SYSTEM only, inherited from restricted directory                                      |
| Authorization path ancestors without reparse points       | PASS                                                                                              |
| Actual answer-file ACL / stable bytes / private integrity | NOT RUN: stopped before private-file access                                                       |
| Actual key records, IDs, ranges, revisions and bindings   | NOT RUN; expected 24, validated count not established                                             |
| Database/Cloud delivery or mutation                       | NOT RUN; not authorized                                                                           |

An initial ACL probe also required the template file itself to disable inheritance and returned FAIL. Follow-up inspected the actual reader contract: parent-directory inheritance must be protected and effective file rules must be restricted to owner/SYSTEM. Both are satisfied; inherited file rules from this protected parent are accepted. No ACL was changed or requirement weakened. The future active record and answer path must still pass the reader's checks independently.

Git ignore/tracking checks do not prove absence of secrets from all historical commits, other filenames or external copies. No private contents/digests were read for an exact-value leakage scan. Prior synthetic delivery evidence does not count as real-key validation.

## Owner action needed

At the repository in a local terminal, the owner should create the actual record from the existing template **only if the active record remains absent**:

```powershell
Copy-Item -LiteralPath .\.local\pilot-hsk1\v1\authorizations\real-key-read-r3.template.json -Destination .\.local\pilot-hsk1\v1\authorizations\real-key-read-r3.json
notepad .\.local\pilot-hsk1\v1\authorizations\real-key-read-r3.json
```

The owner personally fills/changes these fields and saves valid JSON:

- `template_only`: `false`.
- `approved`: `true`.
- `ownerName`: actual name, not a placeholder.
- `signedAt`: actual signing date/time in ISO8601 with timezone; not a future date.
- `confirmation`: actual explicit confirmation/typed signature for reading and validating exact r3 locally, with no database/Cloud/write permission. Include the owner's own typed signature; do not copy an earlier rights/acceptance signature automatically.

Keep action, package revision, manifest/snapshot bindings and restrictive scope unchanged. Do not put answer contents in this record or send name/signature/keys into chat. Tell the agent only that the authorization record is complete. The agent must validate the actual record before invoking the reader; do not run the reader yet as a substitute for the authorization check.

If a record already exists when doing this, do not overwrite it with the template. Review the existing record instead. The agent must not fill, date, sign or activate approval on the owner's behalf.

## Completion criteria and later approvals

After valid owner evidence exists, recheck exact scope, identity/date/confirmation, ACL/Git ignore/public hashes before the trusted local read. Only sanitized status/counts and failure categories may leave the process; no answer indices, explanations, vectors or private digests. Do not loosen interactive/ACL/hash gates to make execution work. If native terminal execution is needed, the owner will receive the exact safe command.

This result is **BLOCKED**, not FAIL of the answer data: the data has not been read. A later PASS would establish local structural integrity and 24 question/key bindings only. It would not prove pedagogical answer uniqueness, independent Chinese-language review, rights clearance, protected database delivery or Cloud readiness.

Separate approval/security review is required before any real-key delivery to an isolated local database, including exact fixture target, logging suppression, parameterized transport, transaction/rollback and sanitized evidence. Cloud draft import requires another target-specific exact-transaction approval, refreshed read-only checks and logging/security review. Publication/promotion, readable owner-only metadata and live study/quiz mutations remain separate approvals. No schema/RLS/migration/guard/content or owner decision changed; no import/publish, push or deploy occurred.
