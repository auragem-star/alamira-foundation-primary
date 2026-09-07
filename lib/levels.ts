export const LEVEL_LABELS: Record<string, string> = {
  FOUNDATION: "تأسيس",
  GRADE_1: "الصف الأول الابتدائي",
  GRADE_2: "الصف الثاني الابتدائي",
  GRADE_3: "الصف الثالث الابتدائي",
  GRADE_4: "الصف الرابع الابتدائي",
  GRADE_5: "الصف الخامس الابتدائي",
  GRADE_6: "الصف السادس الابتدائي",
};

export const LEVEL_ORDER = [
  "FOUNDATION",
  "GRADE_1",
  "GRADE_2",
  "GRADE_3",
  "GRADE_4",
  "GRADE_5",
  "GRADE_6",
] as const;

export type LevelKey = (typeof LEVEL_ORDER)[number];

// المواد الافتراضية (قابلة للتعديل من قاعدة البيانات لاحقًا)
// null في level تعني: متاحة في كل الصفوف
export const DEFAULT_SUBJECTS: { name: string; level: LevelKey | null }[] = [
  { name: "تأسيس لغة عربية", level: "FOUNDATION" },
  { name: "تأسيس لغة إنجليزية", level: "FOUNDATION" },
  { name: "تأسيس رياضيات", level: "FOUNDATION" },
  { name: "اللغة العربية", level: null },
  { name: "اللغة الإنجليزية", level: null },
  { name: "الرياضيات", level: null },
  { name: "العلوم", level: null },
  { name: "الدراسات الاجتماعية", level: null },
  { name: "التربية الدينية", level: null },
  { name: "لغة أجنبية ثانية (فرنسية / ألمانية)", level: null },
  { name: "الحاسب الآلي", level: null },
];
