import { put, del } from "@vercel/blob";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 ميجا كحد أقصى لكل ملف

export async function uploadFile(file: File, pathPrefix: string) {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("حجم الملف كبير جدًا. الحد الأقصى 5 ميجابايت.");
  }
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("نوع الملف غير مدعوم. المسموح: صورة (JPG/PNG) أو PDF فقط.");
  }
  const safeName = `${pathPrefix}/${Date.now()}-${crypto.randomUUID()}`;
  const blob = await put(safeName, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function deleteFile(url: string) {
  try {
    await del(url);
  } catch {
    // الملف ممكن يكون اتمسح قبل كده، متجاهلينها
  }
}
