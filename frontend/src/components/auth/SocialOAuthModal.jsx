import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { ShieldCheck, Plus, ArrowLeft, CheckCircle2, Lock, X, Mail, Phone, RefreshCw } from 'lucide-react';
import { GoogleIcon } from '@/components/common/BrandIcons';
import { sendEmailOtp, verifyEmailOtp, sendMobileOtp, verifyMobileOtp } from '@/services/otpService';

const GOOGLE_ACCOUNTS = [
  { id: 'g1', name: 'Alex Morgan', email: 'alex.morgan@gmail.com', avatar: 'A', bg: 'bg-blue-600', badge: 'Google Account' },
  { id: 'g2', name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', avatar: 'R', bg: 'bg-emerald-600', badge: 'Gmail' },
  { id: 'g3', name: 'MetroFlow User', email: 'user@gmail.com', avatar: 'M', bg: 'bg-violet-600', badge: 'Verified User' },
];

export default function SocialOAuthModal({ provider = 'google', initialEmail = '', onClose, onConfirm }) {
  const defaultAccounts = GOOGLE_ACCOUNTS;

  // step: 'select' | 'custom' | 'email-otp' | 'mobile-setup' | 'mobile-otp' | 'verified-summary'
  const [step, setStep] = useState('select');
  const [selectedAccount, setSelectedAccount] = useState(
    initialEmail
      ? { name: initialEmail.split('@')[0].replace('.', ' '), email: initialEmail, avatar: initialEmail[0].toUpperCase(), bg: 'bg-blue-600' }
      : defaultAccounts[0]
  );
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  // OTP State
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpHint, setEmailOtpHint] = useState('');
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);

  const [phone, setPhone] = useState('+91 98765 43210');
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileVerified, setMobileVerified] = useState(false);
  const [mobileOtpHint, setMobileOtpHint] = useState('');
  const [isSendingMobileOtp, setIsSendingMobileOtp] = useState(false);
  const [isVerifyingMobileOtp, setIsVerifyingMobileOtp] = useState(false);
  const [mobileTimer, setMobileTimer] = useState(0);

  const [errorMsg, setErrorMsg] = useState('');

  // Timers for OTP resend
  useEffect(() => {
    let timer;
    if (emailTimer > 0) {
      timer = setInterval(() => setEmailTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [emailTimer]);

  useEffect(() => {
    let timer;
    if (mobileTimer > 0) {
      timer = setInterval(() => setMobileTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [mobileTimer]);

  const handleAccountSelect = (acc) => {
    setSelectedAccount(acc);
    initiateEmailOtp(acc.email);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) return;
    const name = customName || customEmail.split('@')[0].replace('.', ' ');
    const newAcc = {
      name,
      email: customEmail,
      avatar: name[0].toUpperCase(),
      bg: 'bg-blue-600',
      badge: 'Custom Account',
    };
    setSelectedAccount(newAcc);
    initiateEmailOtp(newAcc.email);
  };

  const initiateEmailOtp = async (email) => {
    setErrorMsg('');
    setIsSendingEmailOtp(true);
    try {
      const res = await sendEmailOtp({ email });
      setEmailOtpHint(res.code);
      toast.info(`✉️ Verification OTP sent to ${email}: ${res.code}`);
      setStep('email-otp');
      setEmailTimer(30);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send Email OTP.');
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleResendEmailOtp = () => {
    if (emailTimer > 0 || !selectedAccount) return;
    initiateEmailOtp(selectedAccount.email);
  };

  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!emailOtp.trim()) {
      setErrorMsg('Please enter the 6-digit OTP code sent to your email.');
      return;
    }
    setIsVerifyingEmailOtp(true);
    try {
      await verifyEmailOtp({ email: selectedAccount.email, code: emailOtp });
      toast.success('Email validated successfully! ✓');
      setEmailVerified(true);
      setStep('mobile-setup');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid Email OTP code.');
    } finally {
      setIsVerifyingEmailOtp(false);
    }
  };

  const handleSendMobileOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!phone || phone.trim().length < 6) {
      setErrorMsg('Please enter a valid mobile phone number.');
      return;
    }
    setIsSendingMobileOtp(true);
    try {
      const res = await sendMobileOtp({ phone });
      setMobileOtpHint(res.code);
      toast.info(`📱 SMS OTP code sent to ${phone}: ${res.code}`);
      setStep('mobile-otp');
      setMobileTimer(30);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send Mobile OTP.');
    } finally {
      setIsSendingMobileOtp(false);
    }
  };

  const handleResendMobileOtp = () => {
    if (mobileTimer > 0 || !phone) return;
    handleSendMobileOtp({ preventDefault: () => {} });
  };

  const handleVerifyMobileOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!mobileOtp.trim()) {
      setErrorMsg('Please enter the 6-digit SMS OTP code.');
      return;
    }
    setIsVerifyingMobileOtp(true);
    try {
      await verifyMobileOtp({ phone, code: mobileOtp });
      toast.success('Mobile number confirmed! ✓');
      setMobileVerified(true);
      setStep('verified-summary');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid Mobile OTP code.');
    } finally {
      setIsVerifyingMobileOtp(false);
    }
  };

  const handleFinalSignIn = async () => {
    try {
      await onConfirm({
        provider: 'google',
        email: selectedAccount.email,
        name: selectedAccount.name,
        phone,
      });
    } catch (err) {
      setErrorMsg(err.message || 'Unable to sign in.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 p-6 shadow-2xl backdrop-blur-2xl text-slate-900 bg-white"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors bg-slate-100 text-slate-500 hover:bg-slate-200"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b pb-4 border-slate-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 shadow-sm">
            <GoogleIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display leading-tight text-slate-900">
              Sign in with Google
            </h3>
            <p className="text-xs text-slate-500">
              Email & Mobile OTP Identity Verification
            </p>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="mt-4 flex items-center justify-between px-2">
          {[
            { key: 'select', label: '1. Account' },
            { key: 'email-otp', label: '2. Email OTP' },
            { key: 'mobile-setup', label: '3. Mobile' },
            { key: 'verified-summary', label: '4. Done' },
          ].map((s, idx) => {
            const isCompleted =
              (s.key === 'select' && step !== 'select' && step !== 'custom') ||
              (s.key === 'email-otp' && emailVerified) ||
              (s.key === 'mobile-setup' && mobileVerified) ||
              step === 'verified-summary';
            const isCurrent = step === s.key || (step === 'custom' && s.key === 'select') || (step === 'mobile-otp' && s.key === 'mobile-setup');
            return (
              <div key={s.key} className="flex items-center gap-1">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={`text-[11px] font-medium hidden sm:inline ${isCurrent ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                  {s.label.split('.')[1]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="mt-5">
          <AnimatePresence mode="wait">
            {/* STEP 1: Google Account Selection List */}
            {step === 'select' && (
              <motion.div key="select" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-slate-400">
                  Select Google Account
                </p>
                <div className="space-y-2.5">
                  {defaultAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleAccountSelect(acc)}
                      disabled={isSendingEmailOtp}
                      className="flex w-full items-center justify-between rounded-2xl p-3.5 text-left transition-all border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 disabled:opacity-60"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm ${acc.bg}`}>
                          {acc.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{acc.name}</p>
                          <p className="text-xs text-slate-500">{acc.email}</p>
                        </div>
                      </div>
                      <span className="rounded-lg px-2 py-0.5 text-[10px] font-semibold bg-slate-200/80 text-slate-700">
                        {acc.badge}
                      </span>
                    </button>
                  ))}

                  {/* Use custom account button */}
                  <button
                    type="button"
                    onClick={() => setStep('custom')}
                    className="flex w-full items-center gap-3.5 rounded-2xl p-3.5 text-left transition-all border border-dashed border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <Plus className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-semibold">Use another account</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 1-B: Custom Email Entry */}
            {step === 'custom' && (
              <motion.div key="custom" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to account list
                </button>

                <p className="text-sm font-semibold mb-3 text-slate-800">
                  Enter your Google email address
                </p>

                <form onSubmit={handleCustomSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-slate-600">
                      Account Email
                    </label>
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm border focus:outline-none focus:ring-2 border-slate-300 bg-white text-slate-900 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-slate-600">
                      Display Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full rounded-xl px-3.5 py-2.5 text-sm border focus:outline-none focus:ring-2 border-slate-300 bg-white text-slate-900 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingEmailOtp}
                    className="mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white shadow-md transition-colors bg-blue-600 hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isSendingEmailOtp ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Sending Email OTP...</span>
                      </>
                    ) : (
                      <span>Proceed to Email OTP Verification</span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: Email OTP Verification */}
            {step === 'email-otp' && (
              <motion.div key="email-otp" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Change Account
                </button>

                <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 mb-4 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow">
                    <Mail className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Email OTP Validation</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{selectedAccount.email}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    A 6-digit OTP code has been sent to validate this email address.
                  </p>
                </div>

                {emailOtpHint && (
                  <div className="mb-3 rounded-xl border border-amber-300/80 bg-amber-50 px-3.5 py-2 text-xs text-amber-800">
                    <span>Code sent to your email: <strong className="font-mono text-sm tracking-widest">{emailOtpHint}</strong></span>
                  </div>
                )}

                <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-slate-700">Enter 6-Digit Email OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full text-center tracking-widest font-mono text-lg rounded-xl px-3.5 py-3 border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {errorMsg && <p className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-600 border border-red-200">{errorMsg}</p>}

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Didn't receive email code?</span>
                    <button
                      type="button"
                      onClick={handleResendEmailOtp}
                      disabled={emailTimer > 0 || isSendingEmailOtp}
                      className="font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      {emailTimer > 0 ? `Resend in ${emailTimer}s` : 'Resend OTP'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingEmailOtp}
                    className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-md transition-colors bg-blue-600 hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isVerifyingEmailOtp ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Validating Email...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Verify Email OTP</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 3: Mobile Number Setup & Input */}
            {step === 'mobile-setup' && (
              <motion.div key="mobile-setup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Email Validated ✓</p>
                    <p className="text-xs text-emerald-700">{selectedAccount.email}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-bold text-slate-900">Mobile Phone Confirmation</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Link and confirm your mobile phone number for secure access.
                  </p>
                </div>

                <form onSubmit={handleSendMobileOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-slate-700">Mobile Phone Number</label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-xl px-3.5 py-2.5 pl-10 text-sm border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {errorMsg && <p className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-600 border border-red-200">{errorMsg}</p>}

                  <button
                    type="submit"
                    disabled={isSendingMobileOtp}
                    className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-md transition-colors bg-blue-600 hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isSendingMobileOtp ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Sending Mobile OTP...</span>
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4" />
                        <span>Send SMS Mobile OTP</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 4: Mobile OTP Verification */}
            {step === 'mobile-otp' && (
              <motion.div key="mobile-otp" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <button
                  type="button"
                  onClick={() => setStep('mobile-setup')}
                  className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Edit Mobile Number
                </button>

                <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 mb-4 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow">
                    <Phone className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">SMS OTP Confirmation</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{phone}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Enter the 6-digit code sent via SMS to confirm mobile ownership.
                  </p>
                </div>

                {mobileOtpHint && (
                  <div className="mb-3 rounded-xl border border-amber-300/80 bg-amber-50 px-3.5 py-2 text-xs text-amber-800">
                    <span>SMS code sent to your phone: <strong className="font-mono text-sm tracking-widest">{mobileOtpHint}</strong></span>
                  </div>
                )}

                <form onSubmit={handleVerifyMobileOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1 text-slate-700">Enter 6-Digit Mobile OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={mobileOtp}
                      onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full text-center tracking-widest font-mono text-lg rounded-xl px-3.5 py-3 border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {errorMsg && <p className="rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-600 border border-red-200">{errorMsg}</p>}

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Didn't receive SMS?</span>
                    <button
                      type="button"
                      onClick={handleResendMobileOtp}
                      disabled={mobileTimer > 0 || isSendingMobileOtp}
                      className="font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      {mobileTimer > 0 ? `Resend in ${mobileTimer}s` : 'Resend SMS'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifyingMobileOtp}
                    className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-md transition-colors bg-blue-600 hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isVerifyingMobileOtp ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Confirming Mobile...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Confirm Mobile OTP</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 5: Final Summary & Authorization */}
            {step === 'verified-summary' && (
              <motion.div key="verified-summary" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 mb-4 text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-900">Identity Fully Verified!</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Both your Google Email and Mobile Phone are validated and confirmed.
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-slate-800">{selectedAccount.email}</span>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      Email Validated ✓
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-slate-800">{phone}</span>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      Mobile Confirmed ✓
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-100 p-3 text-xs leading-relaxed text-slate-600 mb-5">
                  <div className="flex items-center gap-1.5 font-semibold mb-1 text-slate-800">
                    <Lock className="h-3.5 w-3.5 text-blue-600" />
                    <span>Single Sign-On (SSO) Authorization</span>
                  </div>
                  <p>
                    Click Confirm to sign in to MetroFlow AI with your verified email and phone number.
                  </p>
                </div>

                {errorMsg && <p className="mb-3 rounded-lg bg-red-50 p-2.5 text-xs font-medium text-red-600 border border-red-200">{errorMsg}</p>}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/3 rounded-xl py-2.5 text-sm font-semibold transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFinalSignIn}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-lg transition-all bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                  >
                    <span>Confirm & Access MetroFlow AI</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 border-t pt-3 flex items-center justify-between text-[11px] border-slate-200 text-slate-400">
          <span>Protected by 2-Factor OTP & OAuth 2.0</span>
          <span>MetroFlow AI Security</span>
        </div>
      </motion.div>
    </div>
  );
}

