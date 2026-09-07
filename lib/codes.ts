import { customAlphabet } from "nanoid";

// أبجدية من غير حروف/أرقام ملتبسة بصريًا (0/O, 1/I/L)
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const generate = customAlphabet(ALPHABET, 6);

export function generateStudentCode() {
  return `AM${generate()}`;
}

export function generateTeacherCode() {
  return `AT${generate()}`;
}
