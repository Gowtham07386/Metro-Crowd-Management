import { DEMO_OTP_CODE } from '@/constants';

function delay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const activeEmailOtps = new Map();
const activeMobileOtps = new Map();

function generate6DigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Sends OTP to email address for validation.
 */
export async function sendEmailOtp({ email }) {
  await delay(400);
  if (!email || !email.includes('@')) {
    throw new Error('A valid email address is required.');
  }
  const code = generate6DigitCode();
  activeEmailOtps.set(email.toLowerCase(), code);
  return {
    success: true,
    code,
    message: `Verification OTP sent to ${email}`,
  };
}

/**
 * Verifies email OTP code.
 */
export async function verifyEmailOtp({ email, code }) {
  await delay(300);
  const storedCode = activeEmailOtps.get(email.toLowerCase());
  const trimmed = String(code).trim();

  if (trimmed === DEMO_OTP_CODE || trimmed === '123456' || (storedCode && trimmed === storedCode)) {
    activeEmailOtps.delete(email.toLowerCase());
    return { success: true, message: 'Email verified successfully!' };
  }
  throw new Error('Invalid Email OTP code. Please check and try again.');
}

/**
 * Sends OTP to mobile phone number for confirmation.
 */
export async function sendMobileOtp({ phone }) {
  await delay(400);
  if (!phone || phone.trim().length < 6) {
    throw new Error('A valid mobile phone number is required.');
  }
  const code = generate6DigitCode();
  activeMobileOtps.set(phone.trim(), code);
  return {
    success: true,
    code,
    message: `SMS OTP code sent to ${phone}`,
  };
}

/**
 * Verifies mobile OTP code.
 */
export async function verifyMobileOtp({ phone, code }) {
  await delay(300);
  const storedCode = activeMobileOtps.get(phone.trim());
  const trimmed = String(code).trim();

  if (trimmed === DEMO_OTP_CODE || trimmed === '123456' || (storedCode && trimmed === storedCode)) {
    activeMobileOtps.delete(phone.trim());
    return { success: true, message: 'Mobile number confirmed!' };
  }
  throw new Error('Invalid Mobile OTP code. Please check SMS and try again.');
}

/**
 * Mock "send OTP" call for employee admin verification.
 */
export async function sendOtp({ employeeId, phone }) {
  await delay();
  if (!employeeId || !phone) {
    throw new Error('Employee ID and phone number are required.');
  }
  return { success: true, message: `OTP sent to ${phone}.` };
}

export async function verifyOtp({ code }) {
  await delay(400);
  if (code !== DEMO_OTP_CODE && code !== '123456') {
    throw new Error('Invalid OTP. Please try again.');
  }
  return { success: true };
}

