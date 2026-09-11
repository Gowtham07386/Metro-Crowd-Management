import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Minus, Send, Sparkles, X } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Which stations are most crowded right now?',
  'Suggest a low-crowd travel time',
  'What does the AI prediction show for today?',
  'How do I report an incident?',
];

const CANNED_REPLIES = [
  "Here's what I can see: crowd levels are within normal range across most of the network right now.",
  'Based on recent trends, off-peak windows around mid-morning and early evening tend to be least crowded.',
  'The AI model is currently forecasting moderate congestion on the busiest interchange stations during the next peak window.',
  "You can raise an incident from the Emergency Help section, or tell me more here and I'll help you get started.",
];

/**
 * Single floating AI chat assistant component, reused as-is on both the
 * Passenger and Administrator dashboards — there is only one
 * implementation, mounted once per layout via PassengerLayout/AdminLayout.
 */
export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'assistant', text: "Hi! I'm your MetroFlow AI assistant. Ask me about crowd levels, schedules, or predictions." },
  ]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!isOpen || isMinimized) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping, isOpen, isMinimized]);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: trimmed }]);
    setDraft('');
    setIsTyping(true);
    setTimeout(() => {
      const reply = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: reply }]);
      setIsTyping(false);
    }, 1100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(draft);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1, height: isMinimized ? 56 : 460 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl border border-white/25 bg-white/90 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-3 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">MetroFlow AI</p>
                {!isMinimized && <p className="text-[11px] text-white/75">Always here to help</p>}
              </div>
              <button
                type="button"
                onClick={() => setIsMinimized((v) => !v)}
                className="rounded-lg p-1.5 hover:bg-white/15 focus-ring"
                aria-label={isMinimized ? 'Maximize chat' : 'Minimize chat'}
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 hover:bg-white/15 focus-ring"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1 rounded-2xl bg-slate-100 px-3.5 py-2.5">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="h-1.5 w-1.5 rounded-full bg-slate-400"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.length <= 1 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {SUGGESTED_PROMPTS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => sendMessage(p)}
                          className="flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-[11px] font-medium text-brand-700 hover:bg-brand-100 focus-ring"
                        >
                          <Sparkles className="h-3 w-3" /> {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Composer */}
                <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-100 px-3 py-3">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Ask MetroFlow AI…"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus-ring"
                  />
                  <button
                    type="submit"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md transition-transform active:scale-95 focus-ring"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => {
          setIsOpen((v) => !v);
          setIsMinimized(false);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-2xl shadow-brand-600/40 focus-ring"
        aria-label={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </motion.button>
    </div>
  );
}
