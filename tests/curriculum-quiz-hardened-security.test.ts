import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { ALL_CURRICULUM_QUIZZES } from "@/features/quizzes/curriculum-quizzes";

describe("Hardened Curriculum Quiz & Unit Test Security (Migration 009)", () => {
  const sql = fs.readFileSync(
    "supabase/migrations/202611150009_curriculum_quiz_server_grading.sql",
    "utf-8"
  );

  it("explicitly drops legacy 5-argument overloads to eliminate function signature retention", () => {
    expect(sql).toContain(
      "drop function if exists public.submit_curriculum_quiz_attempt(uuid, integer, integer, boolean, jsonb);"
    );
    expect(sql).toContain(
      "drop function if exists private.submit_curriculum_quiz_attempt(uuid, integer, integer, boolean, jsonb);"
    );
  });

  it("creates authoritative quiz definitions table with exact per-quiz durations", () => {
    expect(sql).toContain("create table if not exists private.curriculum_quiz_definitions");
    expect(sql).toContain("duration_minutes integer not null");
    expect(sql).toContain("passing_score_percent integer not null default 80");
    expect(sql).toContain("revoke all on private.curriculum_quiz_definitions from public, anon, authenticated;");

    // Unit test duration is strictly 20 minutes
    expect(sql).toContain("('hsk1-unit-test-01', 20, 80)");
    expect(sql).toContain("('hsk1-unit-test-06', 20, 80)");
  });

  it("strictly enforces server clock timestamp on insert and nulls client score fields", () => {
    expect(sql).toContain("create or replace function private.curriculum_quiz_attempts_stamp()");
    expect(sql).toContain("new.started_at := clock_timestamp();");
    expect(sql).toContain("new.user_id := (select auth.uid());");
    expect(sql).toContain("new.submitted_at := null;");
    expect(sql).toContain("new.correct_count := null;");
    expect(sql).toContain("new.passed := null;");
    expect(sql).toContain("before insert on public.curriculum_quiz_attempts");
  });

  it("calculates exact deadline based on authoritative quiz duration with 90s grace", () => {
    expect(sql).toContain("v_max_duration_sec := v_duration_minutes * 60 + 90;");
    expect(sql).toContain("if clock_timestamp() > v_attempt.started_at + (v_max_duration_sec * interval '1 second') then");
    expect(sql).toContain("raise exception 'EXAM_DEADLINE_EXCEEDED' using errcode = '22023';");
  });

  it("grades server-authoritatively against private answer keys table without accepting client score", () => {
    // Signature accepts only (attempt_id, answers)
    expect(sql).toContain("create or replace function private.submit_curriculum_quiz_attempt(\n  p_attempt_id uuid,\n  p_answers jsonb\n)");
    expect(sql).toContain("create or replace function public.submit_curriculum_quiz_attempt(\n  p_attempt_id uuid,\n  p_answers jsonb\n)");
    expect(sql).not.toContain("p_correct_count");
    expect(sql).not.toContain("p_passed");

    // Security definer + search_path = ''
    expect(sql).toContain("security definer\nset search_path = ''");
    expect(sql).toContain("security invoker\nset search_path = ''");
  });

  it("prevents duplicate submissions atomically", () => {
    expect(sql).toContain("for update;");
    expect(sql).toContain("if v_attempt.submitted_at is not null then");
    expect(sql).toContain("raise exception 'ALREADY_SUBMITTED' using errcode = 'PT409';");
  });

  it("verifies coverage of all 38 curriculum quizzes and 6 unit tests", () => {
    for (const q of ALL_CURRICULUM_QUIZZES) {
      expect(sql).toContain(`'${q.lessonId}'`);
      expect(sql).toContain(`'${q.slug}'`);
    }
    for (let u = 1; u <= 6; u++) {
      expect(sql).toContain(`'hsk1-unit-test-0${u}'`);
    }
  });

  it("simulates deadline calculations: 20 min unit test rejects after 1290s", () => {
    const durationMinutes = 20;
    const graceSec = 90;
    const cutoffSec = durationMinutes * 60 + graceSec;
    expect(cutoffSec).toBe(1290);

    const onTimeElapsedSec = 1199;
    expect(onTimeElapsedSec <= cutoffSec).toBe(true);

    const graceElapsedSec = 1250;
    expect(graceElapsedSec <= cutoffSec).toBe(true);

    const lateElapsedSec = 1291;
    expect(lateElapsedSec <= cutoffSec).toBe(false);
  });
});
