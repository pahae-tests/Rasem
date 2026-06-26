export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone) {
  return /^[+\d\s\-()]{7,20}$/.test(phone);
}

export function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, 2000);
}
