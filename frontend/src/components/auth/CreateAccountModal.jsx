import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { User, Phone, Mail, Lock, UserPlus } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name'),
    phone: z.string().min(7, 'Enter a valid phone number'),
    email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Sign-up form content. Rendered inside AuthShell's right-hand panel,
 * selected via the Sign Up tab -- there is only one authentication surface
 * in the app, this is just its second tab.
 */
export default function CreateAccountModal({ onBack }) {
  const { registerAccount } = useAuth();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await registerAccount(values);
      toast.success('Account created -- please sign in.');
      onBack();
    } catch (err) {
      setServerError(err.message || 'Unable to create account.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 className="font-display text-2xl font-bold text-white">Create Account</h2>
      <p className="mt-1 text-sm text-white/70">Join MetroFlow to plan smarter journeys.</p>

      <form className="mt-5 space-y-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Full Name"
          icon={User}
          placeholder="Asha Rao"
          error={errors.name?.message}
          className="bg-white/90"
          labelClassName="text-white/85"
          {...register('name')}
        />
        <Input
          label="Phone Number"
          icon={Phone}
          placeholder="+91 90000 00000"
          error={errors.phone?.message}
          className="bg-white/90"
          labelClassName="text-white/85"
          {...register('phone')}
        />
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="you@metroflow.app"
          error={errors.email?.message}
          className="bg-white/90"
          labelClassName="text-white/85"
          {...register('email')}
        />
        <Input
          label="Create Password"
          type="password"
          icon={Lock}
          placeholder="At least 8 characters"
          error={errors.password?.message}
          className="bg-white/90"
          labelClassName="text-white/85"
          {...register('password')}
        />
        <Input
          label="Confirm Password"
          type="password"
          icon={Lock}
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          className="bg-white/90"
          labelClassName="text-white/85"
          {...register('confirmPassword')}
        />

        {serverError && <p className="rounded-lg bg-danger/20 px-3 py-2 text-sm font-medium text-white">{serverError}</p>}

        <Button type="submit" fullWidth icon={UserPlus} isLoading={isSubmitting} size="lg" className="mt-1">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/70">
        Already have an account?{' '}
        <button type="button" onClick={onBack} className="font-semibold text-white hover:text-brand-200">
          Sign In
        </button>
      </p>
    </motion.div>
  );
}
