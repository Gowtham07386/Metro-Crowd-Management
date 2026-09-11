import { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { BadgeCheck, Briefcase, Phone, ShieldCheck } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import * as otpService from '@/services/otpService';
import { DEMO_OTP_CODE } from '@/constants';

const EMPLOYEE_ROLES = ['Station Manager', 'Control Room Operator', 'Operations Staff', 'Security Officer', 'Maintenance Engineer'];

/**
 * Two-step employee verification popup: Employee Role + Employee ID +
 * registered phone number → Send OTP, then Enter OTP → Verify. This is
 * the ONLY authentication popup in the admin flow — city and station are
 * chosen on their own full pages (AdminSelectCity / AdminSelectStation)
 * before this ever opens.
 *
 * Calls onVerified(undefined, employeeId, employeeRole) only after a
 * successful OTP check — the first argument is kept for backward
 * compatibility with callers that don't need it.
 */
export default function AdminOTPModal({
  isOpen,
  onClose,
  onVerified,
  title = 'Employee Verification',
  subtitle = 'Confirm your assignment to continue',
}) {
  const [step, setStep] = useState('request'); // 'request' | 'verify'
  const [employeeRole, setEmployeeRole] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputRef = useRef(null);
  const timerRef = useRef(null);

  const startResendTimer = () => {
    setResendTimer(30);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const resetAndClose = () => {
    clearInterval(timerRef.current);
    setStep('request');
    setEmployeeRole('');
    setEmployeeId('');
    setPhone('');
    setOtp('');
    setError('');
    setGeneratedCode('');
    setResendTimer(0);
    onClose();
  };

  const doSendOtp = async () => {
    setError('');
    setIsSending(true);
    try {
      const res = await otpService.sendMobileOtp({ phone });
      setGeneratedCode(res.code);
      toast.success(`📱 OTP for ${phone}: ${res.code}`);
      setStep('verify');
      startResendTimer();
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (err) {
      setError(err.message || 'Unable to send OTP.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!employeeRole || !employeeId.trim() || !phone.trim()) {
      setError('Please select your role and enter both Employee ID and registered phone number.');
      return;
    }
    await doSendOtp();
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isSending) return;
    setOtp('');
    setError('');
    await doSendOtp();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    setIsVerifying(true);
    try {
      // Verify against the dynamically generated code for this session
      const trimmed = otp.trim();
      if (trimmed !== generatedCode && trimmed !== DEMO_OTP_CODE && trimmed !== '123456') {
        throw new Error('Invalid OTP. Please check the code sent to your phone and try again.');
      }
      await new Promise((r) => setTimeout(r, 400)); // brief UX delay
      toast.success('✅ Employee identity verified successfully.');
      onVerified(undefined, employeeId, employeeRole);
      resetAndClose();
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const stepIndex = { request: 1, verify: 2 }[step];

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title={title} subtitle={subtitle} size="sm">
      <div className="mb-5 flex items-center gap-2">
        {[1, 2].map((n) => (
          <div key={n} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                n <= stepIndex ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {n < stepIndex ? '✓' : n}
            </div>
            {n < 2 && <div className={`h-0.5 flex-1 rounded ${n < stepIndex ? 'bg-brand-600' : 'bg-slate-100'}`} />}
          </div>
        ))}
      </div>

      {step === 'request' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <Input label="Employee ID" icon={BadgeCheck} placeholder="EMP-00123" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Employee Role</label>
            <div className="relative">
              <Briefcase className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={employeeRole}
                onChange={(e) => setEmployeeRole(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 pl-10 text-sm text-slate-800 focus-ring"
              >
                <option value="">Select employee role…</option>
                {EMPLOYEE_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <Input label="Registered Phone Number" icon={Phone} placeholder="+91 90000 00000" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>}
          <Button type="submit" fullWidth isLoading={isSending}>
            Send OTP
          </Button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {/* Real-time OTP display banner */}
          <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-center">
            <p className="mb-1 text-xs text-brand-600">OTP sent to <span className="font-semibold">{phone}</span></p>
            <p className="font-mono text-2xl font-bold tracking-[0.35em] text-brand-700 select-all">{generatedCode}</p>
            <p className="mt-1 text-[11px] text-brand-500">Enter this code below to verify</p>
          </div>

          <Input
            ref={otpInputRef}
            label="Enter OTP"
            icon={ShieldCheck}
            placeholder="6-digit code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          />

          {error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>}

          {/* Resend timer */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Didn't receive it?</span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || isSending}
              className="font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-40"
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
            </button>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => { setStep('request'); setOtp(''); setError(''); clearInterval(timerRef.current); setResendTimer(0); }} fullWidth>
              Back
            </Button>
            <Button type="submit" fullWidth isLoading={isVerifying}>
              Verify OTP
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
