# HSK 1 Pilot r3 — local real-key read verification

2026-11-13. **Real-key read-only validation: PASS, 24 records.**

The earlier AUTHORIZATION_PENDING state was resolved by the owner's actual local record. Name/date/confirmation, exact scope/public hashes, ACL and Git ignore checks passed without publishing identity/signature. The trusted reader then returned PASS with 24 records in `real-read-only` mode. An initial PS5 ACL subprocess could not resolve Get-Acl under an inherited PS7 module path; adding the built-in Windows module directory restored the same ACL checks without weakening them.

The owner subsequently approved routine trusted-local reads without per-run authorization records. Current command: `npm run content`; current policy/commands are in README. Old signed records and templates are historical, retained unchanged and not read by the current workflow. No new record, signature, date or report is needed for another local validation.

Verified: exact frozen r3 public hashes, quiz revisions 3/2/2/2, 24 unique question/key records and public quiz bindings, valid indices/explanation structure, restricted ACL/no reparse, Git ignore/untracked status and stable private bytes. Output was status/counts only. No answer, explanation, answer vector or private digest was published. No database connection or key delivery was performed.

This PASS establishes structural integrity/bindings, not independent language review, answer uniqueness under every reasonable reading, originality, rights clearance or Cloud readiness. Routine validation does not send real keys into any database. Protected DB delivery, exact Cloud transaction, publication/promotion, security changes and real study/quiz mutations still require separate implementation/review and explicit approval. Frozen r3, owner decisions, 159 human-review PENDING, migrations/RLS and Sprint 2.2 guard remain unchanged.
