# Catalog, nguồn và quyền sử dụng

Draft revision 2 — chỉ là hồ sơ chờ người duyệt. Không có human PASS.

Manifest SHA-256: `2af731b28decc13e72824bee95461fb33dd892b7605b72f5b4956b489ebd6661`.

Package snapshot SHA-256: `f6bee81f2329f7822d2aeab8187b7f45de324c0fa7fd3744f2373672b40b2b94`.

Ghi quyết định theo stable_id trong REVIEW_REGISTER; không sửa nội dung nguồn.

## syllabus

- id: 8b8b06ff-5563-5a67-9197-9ffc9b25a8f9
- code: HSK-2025-11-HANLEARN-PILOT-V1
- display_name: HSK 1 pilot — đối chiếu đề cương 11/2025, chờ kiểm duyệt
- published_on: null
- effective_on: null
- verified_at: null
- official_vocab_totals: {}
- is_active: false
- status: draft
- review_status: pending
- source_uri: urn:hanlearn:pilot-hsk1:v1:syllabus
- content_license: pending-rights-review
- reviewed_by: null
- reviewed_at: null

## course

- id: 2c99d2ff-db03-5ef5-ace1-0a8669d4ac28
- syllabus_id: 8b8b06ff-5563-5a67-9197-9ffc9b25a8f9
- hsk_level: 1
- title: Tiếng Trung khởi đầu cho người Việt — HSK 1 pilot
- sort_order: 1
- status: draft
- review_status: pending
- source_uri: urn:hanlearn:pilot-hsk1:v1:course
- content_license: pending-rights-review
- reviewed_by: null
- reviewed_at: null

## unit

- id: 0bf24f9c-503d-54ce-a6f0-bea9312d6d4c
- course_id: 2c99d2ff-db03-5ef5-ace1-0a8669d4ac28
- title: Chào hỏi, bản thân, gia đình và thời gian
- sort_order: 1
- status: draft
- review_status: pending
- source_uri: urn:hanlearn:pilot-hsk1:v1:unit
- content_license: pending-rights-review
- reviewed_by: null
- reviewed_at: null

## Nguồn HSK

- id: cti-hsk-2025-11
- title: HSK考试大纲
- edition: 2025-11; cover states implementation 2026-07
- landing_uri: https://www.chinesetest.cn/syllabus
- source_uri: https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf
- pdf_sha256: d8b6646599bc9a0c9616a4cb06d4b37461f8792f70a3171016d00fcd8eda09ad
- extracted_text_sha256: 37e73e1f4de2c8f7652acc3b92788f7f37232d47862f3fe7725510896e87c5b1
- cover_pdf_page: 1
- vocabulary_pdf_pages: [80,87]
- vocabulary_printed_pages: [77,84]
- grammar_pdf_pages: [386,388]
- grammar_printed_pages: [383,385]
- selected_level1_headwords: 43
- machine_checked_on: 2026-11-13
- comparison_by: AI-assisted exact-headword/reading lookup; not human approval
- human_reviewer: null
- human_reviewed_at: null

Headword/reading đã đối chiếu máy khác với human sense review và quyền sử dụng. Không trộn phiên bản nguồn. 越南 vẫn bổ trợ; không cộng vào membership cấp 1.

## Rights manifest (đầy đủ)

```json
{
  "package_id": "hanlearn-pilot-hsk1-v1",
  "review_state": "pending_review",
  "declared_origin": "AI-assisted original Vietnamese teaching text, examples and quiz drafting",
  "authoring_date": "2026-11-13",
  "human_reviewer": null,
  "human_reviewed_at": null,
  "distribution_license": null,
  "sources": [
    {
      "source_id": "cti-hsk-2025-11",
      "uri": "https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf",
      "use": "Selected lexical membership/readings and grammar-category comparison only; no copied lessons or full list.",
      "full_document_distributed": false,
      "permission_state": "pending_review"
    }
  ],
  "scopes": [
    "Vietnamese explanations/translations",
    "Original example sentences and fictional dialogues",
    "Grammar presentation",
    "Quiz prompts/distractors",
    "Private explanations/answer-key management"
  ],
  "review_required": [
    "Chinese language/pinyin/native naturalness",
    "Rights/originality and permission for intended distribution",
    "No proprietary HelloChinese or paid-textbook copying",
    "Exact source edition/senses and supplemental labeling",
    "Private answer storage/sharing/backups before approval"
  ],
  "third_party_lesson_text_copied": false,
  "third_party_reference_facts_used": true,
  "ai_assistance_disclosed": true,
  "audio": {
    "files": [],
    "state": "unavailable_no_assets"
  },
  "publication_blocked": true
}
```
