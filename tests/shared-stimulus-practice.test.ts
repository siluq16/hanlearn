import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  resolvePracticePresentationMode,
  type PracticeSet,
  type SharedStimulus,
} from "../src/features/practice/types";

describe("Sprint 8K: Adaptive Practice Presentation & Shared Stimulus Model", () => {
  // 1. Synthetic Shared Stimulus: Long Reading Comprehension
  const syntheticLongReadingSet: PracticeSet = {
    practice_set_id: "synth-read-long-01",
    course_id: "course-hsk1",
    unit_id: "u-hsk1-04",
    skill: "reading",
    exercise_type: "passage_qa",
    title: "Bài đọc hiểu dài: Một ngày của Vương Bình (王平的一天)",
    description: "Đọc đoạn văn 5 câu và trả lời 3 câu hỏi kiểm tra chi tiết",
    difficulty: "medium",
    question_count: 3,
    presentation_mode: "reading_comprehension",
    stimulus: {
      type: "text_passage",
      title: "王平的一天 (Một ngày của Vương Bình)",
      content:
        "王平是北京大学的学生。他每天早上七点起床，八点去教室上课。\n\n中午十二点，他和同学一起在学校食堂吃米饭和牛肉。下午没有课的时候，他喜欢去图书馆看书。\n\n晚上九点，他回到宿舍喝茶，十点半睡觉。",
      paragraphs: [
        "王平是北京大学的学生。他每天早上七点起床，八点去教室上课。",
        "中午十二点，他和同学一起在学校食堂吃米饭和牛肉。下午没有课的时候，他喜欢去图书馆看书。",
        "晚上九点，他回到宿舍喝茶，十点半睡觉。",
      ],
      translationVi:
        "Vương Bình là sinh viên Đại học Bắc Kinh. Mỗi ngày anh ấy thức dậy lúc 7 giờ sáng, 8 giờ đến lớp học. Buổi trưa lúc 12 giờ, anh ấy cùng bạn học ăn cơm và thịt bò ở nhà ăn trường. Buổi chiều khi không có tiết, anh thích đến thư viện đọc sách. Buổi tối lúc 9 giờ, anh về ký túc xá uống trà và 10 giờ rưỡi đi ngủ.",
    },
    questions: [
      {
        id: "q-sr-01",
        type: "reading_mcq",
        prompt: "王平早上几点去教室上课？ (Vương Bình mấy giờ đến lớp?)",
        choices: ["六点", "七点", "八点", "九点"],
        correct_index: 2,
        explanation_vi: "Đoạn 1 nêu rõ: 八点去教室上课 (8 giờ đi học).",
      },
      {
        id: "q-sr-02",
        type: "reading_mcq",
        prompt: "中午王平在哪里吃饭？ (Buổi trưa Vương Bình ăn cơm ở đâu?)",
        choices: ["在饭店", "在学校食堂", "在家里", "在图书馆"],
        correct_index: 1,
        explanation_vi: "Đoạn 2 nêu rõ: 在学校食堂吃米饭 (ăn ở nhà ăn trường).",
      },
      {
        id: "q-sr-03",
        type: "reading_mcq",
        prompt: "下午没有课的时候，王平喜欢去哪里？ (Chiều không có tiết, Vương Bình thích đi đâu?)",
        choices: ["去商店", "去医院", "去图书馆", "去火车站"],
        correct_index: 2,
        explanation_vi: "Đoạn 2 nêu rõ: 喜欢去图书馆看书 (thích đến thư viện đọc sách).",
      },
    ],
  };

  // 2. Synthetic Shared Stimulus: Listening Comprehension with Shared Audio
  const syntheticSharedAudioListeningSet: PracticeSet = {
    practice_set_id: "synth-listen-shared-01",
    course_id: "course-hsk1",
    unit_id: "u-hsk1-02",
    skill: "listening",
    exercise_type: "dialogue_comprehension",
    title: "Nghe hiểu hội thoại gọi món tại nhà hàng",
    description: "Nghe một đoạn audio hội thoại chung và trả lời 2 câu hỏi liên tiếp",
    difficulty: "medium",
    question_count: 2,
    presentation_mode: "listening_comprehension",
    stimulus: {
      type: "audio",
      title: "Hội thoại gọi món ăn",
      audioText: "服务员：您好，您想吃什么？李月：我想吃一碗牛肉面，喝一杯热茶。",
      audioDurationSeconds: 6,
    },
    questions: [
      {
        id: "q-sl-01",
        type: "listening_mcq",
        prompt: "李月想吃什么？ (Lý Nguyệt muốn ăn gì?)",
        choices: ["米饭", "牛肉面", "苹果", "饺子"],
        correct_index: 1,
        explanation_vi: "Trong audio: 我想吃一碗牛肉面 (Tôi muốn ăn một bát mì bò).",
      },
      {
        id: "q-sl-02",
        type: "listening_mcq",
        prompt: "李月想喝什么？ (Lý Nguyệt muốn uống gì?)",
        choices: ["冷水", "牛奶", "热茶", "咖啡"],
        correct_index: 2,
        explanation_vi: "Trong audio: 喝一杯热茶 (Uống một tách trà nóng).",
      },
    ],
  };

  it("resolves presentation mode accurately for synthetic shared stimulus sets", () => {
    expect(resolvePracticePresentationMode(syntheticLongReadingSet)).toBe(
      "reading_comprehension"
    );
    expect(resolvePracticePresentationMode(syntheticSharedAudioListeningSet)).toBe(
      "listening_comprehension"
    );
  });

  it("stimulus preserves text without duplicating into individual questions", () => {
    expect(syntheticLongReadingSet.stimulus?.content).toContain("王平是北京大学的学生");
    expect(syntheticLongReadingSet.questions?.every((q) => !q.passage)).toBe(true);
    expect(syntheticLongReadingSet.questions?.length).toBe(3);
  });

  it("backward-compatibility: resolves all 56 real practice bank sets into correct modes", () => {
    const practiceBankPath = path.resolve(
      process.cwd(),
      "content/hsk_library/practice_bank.json"
    );
    const pb = JSON.parse(fs.readFileSync(practiceBankPath, "utf8"));
    expect(pb.sets.length).toBe(56);

    const modeCounts: Record<string, number> = {};

    for (const set of pb.sets) {
      const mode = resolvePracticePresentationMode(set);
      modeCounts[mode] = (modeCounts[mode] || 0) + 1;
      expect([
        "single_question",
        "matching_board",
        "reading_comprehension",
        "listening_comprehension",
        "dialogue_roleplay",
      ]).toContain(mode);
    }

    expect(modeCounts["matching_board"]).toBe(1); // ps-vocab-05
    expect(modeCounts["dialogue_roleplay"]).toBe(8); // 8 dialogue sets
    expect(modeCounts["single_question"]).toBeGreaterThan(30);
  });
});
