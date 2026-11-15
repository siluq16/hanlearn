import { createServerClient } from "@supabase/ssr";
import { developmentConfig, testStore } from "./development.mjs";

const account = testStore("Read");
const config = developmentConfig();

const cookies = new Map();
const supabase = createServerClient(config.url, config.key, {
  cookies: {
    getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
    setAll: (rows) => {
      for (const row of rows) {
        if (row.value) cookies.set(row.name, row.value);
        else cookies.delete(row.name);
      }
    },
  },
});

const loginRes = await supabase.auth.signInWithPassword({
  email: account.email,
  password: account.password,
});

if (loginRes.error) {
  console.error("Auth error:", loginRes.error);
  process.exit(1);
}

const user = loginRes.data.user;
console.log("Logged in user:", user.id, user.email);

// 1. Stage progress
const { data: stages } = await supabase
  .from("learner_stage_progress")
  .select("*")
  .eq("user_id", user.id);
console.log("learner_stage_progress rows:", stages?.length, stages);

// 2. Quiz attempts
const { data: attempts } = await supabase
  .from("curriculum_quiz_attempts")
  .select("lesson_id, quiz_id, correct_count, question_count, passed, submitted_at")
  .eq("user_id", user.id);
console.log("curriculum_quiz_attempts rows:", attempts?.length);
attempts?.forEach((a) => {
  console.log(`- ${a.lesson_id} (correct: ${a.correct_count}/${a.question_count}, passed: ${a.passed})`);
});

// 3. Review cards
const { data: cards } = await supabase
  .from("review_cards")
  .select("id, card_type, due_at, state")
  .eq("user_id", user.id);
console.log("review_cards rows:", cards?.length);

// 4. Vocabulary progress
const { data: vprog } = await supabase
  .from("vocabulary_progress")
  .select("*")
  .eq("user_id", user.id);
console.log("vocabulary_progress rows:", vprog?.length);
