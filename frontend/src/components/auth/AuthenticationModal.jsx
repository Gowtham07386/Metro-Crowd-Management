import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Mail, Lock, LogIn } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { GoogleIcon } from '@/components/common/BrandIcons';
import SocialOAuthModal from '@/components/auth/SocialOAuthModal';
import { useAuth } from '@/hooks/useAuth';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

/**
 * Sign-in form content. Rendered inside AuthShell's right-hand panel — no
 * outer card chrome of its own, so there's only one glass panel on screen.
 *
 * Calls onSignedIn() after a successful login; the caller routes on to the
 * existing role/city selection flow.
 */
export default function AuthenticationModal({ onSignedIn, onCreateAccount }) {
  const { login, loginWithSocial } = useAuth();
  const [serverError, setServerError] = useState('');
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | null
  const [socialModalProvider, setSocialModalProvider] = useState(null); // 'google' | null

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '', rememberMe: true } });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await login(values);
      toast.success('Welcome to MetroFlow!');
      onSignedIn();
    } catch (err) {
      setServerError(err.message || 'Unable to sign in.');
    }
  };

  const handleSocialConfirm = async ({ provider, email, name }) => {
    setServerError('');
    setSocialLoading(provider);
    try {
      const providerLabel = 'Google';

      await loginWithSocial({
        provider,
        email,
        name: name || 'Google User',
        rememberMe: true,
      });

      toast.success(`Signed in successfully with ${providerLabel}!`);
      setSocialModalProvider(null);
      onSignedIn();
    } catch (err) {
      setServerError(err.message || `Unable to sign in with ${provider}.`);
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSocialClick = (provider) => {
    setSocialModalProvider(provider);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <h2 className="font-display text-2xl font-bold text-white">Welcome Back</h2>
      <p className="mt-1 text-sm text-white/70">Sign in to continue</p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Email / Gmail"
          type="email"
          icon={Mail}
          placeholder="you@metroflow.app"
          error={errors.email?.message}
          className="bg-white/90"
          labelClassName="text-white/85"
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="********"
          error={errors.password?.message}
          className="bg-white/90"
          labelClassName="text-white/85"
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" className="h-4 w-4 rounded border-white/40 text-brand-600 focus-ring" {...register('rememberMe')} />
            Remember me
          </label>
          <button
            type="button"
            className="text-sm font-medium text-white hover:text-brand-200"
            onClick={() => toast.info('Password reset instructions would be emailed here.')}
          >
            Forgot Password?
          </button>
        </div>

        {serverError && <p className="rounded-lg bg-danger/20 px-3 py-2 text-sm font-medium text-white">{serverError}</p>}

        <Button type="submit" fullWidth icon={LogIn} isLoading={isSubmitting} size="lg">
          Sign In
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/20" />
        <span className="text-xs font-medium uppercase tracking-wide text-white/50">Or</span>
        <div className="h-px flex-1 bg-white/20" />
      </div>

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => handleSocialClick('google')}
          disabled={Boolean(socialLoading)}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/25 bg-white/90 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-white focus-ring disabled:opacity-60"
        >
          <GoogleIcon /> {socialLoading === 'google' ? 'Signing in with Google...' : 'Continue with Google'}
        </button>
      </div>

      {/* Realistic Interactive Social OAuth Modal (Account Picker & Security Verification) */}
      {socialModalProvider && (
        <SocialOAuthModal
          provider={socialModalProvider}
          initialEmail={watch('email')}
          onClose={() => setSocialModalProvider(null)}
          onConfirm={handleSocialConfirm}
        />
      )}

      <p className="mt-6 text-center text-sm text-white/70">
        Don't have an account?{' '}
        <button type="button" onClick={onCreateAccount} className="font-semibold text-white hover:text-brand-200">
          Create New Account
        </button>
      </p>
    </motion.div>
  );
}
