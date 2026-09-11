import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { Mail, Phone, MapPin, User, MessageSquare, Send } from 'lucide-react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  message: z.string().min(10, 'Message should be at least 10 characters'),
});

const CONTACT_DETAILS = [
  { icon: Mail, text: 'operations@metroflow.app' },
  { icon: Phone, text: '1800-111-METRO' },
  { icon: MapPin, text: 'Smart City Control Center' },
];

export default function ContactSection() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    // Demo only — no backend wired up yet.
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Message sent — our team will get back to you shortly.');
    setSent(true);
    reset();
  };

  return (
    <section id="contact" className="scroll-mt-20 bg-white px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Contact Us</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Let&apos;s talk about your metro network
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
            Questions about deploying MetroFlow for your city, or feedback on the platform? Send us a
            message and our team will follow up.
          </p>

          <ul className="mt-6 space-y-3">
            {CONTACT_DETAILS.map((c) => (
              <li key={c.text} className="flex items-center gap-3 text-sm text-slate-600">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                  <c.icon className="h-4 w-4" />
                </span>
                {c.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl glass-panel p-6 sm:p-7">
          {sent ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                <Send className="h-5 w-5" />
              </div>
              <p className="font-display text-lg font-bold text-slate-900">Message sent</p>
              <p className="text-sm text-slate-500">Thanks for reaching out — we&apos;ll be in touch soon.</p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Input label="Full Name" icon={User} placeholder="Your name" error={errors.name?.message} {...register('name')} />
              <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
              <div className="w-full">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Message</label>
                <div className="relative">
                  <MessageSquare className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <textarea
                    rows={4}
                    placeholder="How can we help?"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 pl-10 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus-ring"
                    {...register('message')}
                  />
                </div>
                {errors.message?.message && <p className="mt-1.5 text-xs font-medium text-danger">{errors.message.message}</p>}
              </div>
              <Button type="submit" fullWidth icon={Send} isLoading={isSubmitting}>
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
