const NON_DIGIT_EXCEPT_PLUS = /[^\d+]/g;

export const normalizeWhatsAppPhone = (input: string): string | null => {
  const raw = String(input || "").trim();
  if (!raw) return null;

  let digits = raw.replace(NON_DIGIT_EXCEPT_PLUS, "").replace(/\+/g, "");
  if (!digits) return null;

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // Algeria-friendly normalization:
  // 0555123456  -> 213555123456
  // 555123456   -> 213555123456
  if (digits.startsWith("0") && digits.length === 10) {
    digits = `213${digits.slice(1)}`;
  } else if (digits.length === 9 && !digits.startsWith("213")) {
    digits = `213${digits}`;
  }

  if (!/^\d{8,15}$/.test(digits)) {
    return null;
  }

  return digits;
};

export const formatWhatsAppForStorage = (input: string): string => {
  const normalized = normalizeWhatsAppPhone(input);
  return normalized ? `+${normalized}` : "";
};
