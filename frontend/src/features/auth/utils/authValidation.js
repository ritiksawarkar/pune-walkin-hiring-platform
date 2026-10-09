/**
 * Authentication Input Validation Utilities
 * Form checks for email, phone numbers, and password strengths
 */

export function validateEmail(email) {
  if (!email || !email.trim()) {
    return "Email address is required.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address.";
  }
  return null;
}

export function validatePassword(password) {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  return null;
}

export function validatePhone(phone) {
  if (!phone || !phone.trim()) {
    return "Mobile number is required.";
  }
  const cleanPhone = phone.replace(/[\s\-+]/g, "");
  if (!/^\d{10}$/.test(cleanPhone)) {
    return "Please enter a valid 10-digit mobile number.";
  }
  return null;
}
