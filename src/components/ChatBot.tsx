import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Bot, User, Minimize2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Link } from "wouter";
import logoCanvas from "@/assets/images/logo_canvas.png";
import { useBranding, useChatPage } from "@/lib/api";
import { brandDisplayName, resolveBrandingLogoUrl } from "@/lib/api/branding-ui";
import { whatsAppLinkFromBranding } from "@/lib/api/social-links";

type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
};

function getBotResponse(input: string, responses: Record<string, string>): string {
  const lower = input.toLowerCase();
  const keys = Object.keys(responses).filter((k) => k !== "default");
  for (const key of keys) {
    const tokens = key.split(" ");
    if (tokens.some((t) => lower.includes(t))) {
      return responses[key];
    }
  }
  if (lower.includes("picnic") || lower.includes("day trip")) {
    return responses["trip packages"] ?? responses.default;
  }
  if (lower.includes("wedding") || lower.includes("group") || lower.includes("event")) {
    return responses["group & events"] ?? responses.default;
  }
  return responses.default;
}

export function ChatBot() {
  const { data: branding } = useBranding();
  const { data: chatPage } = useChatPage();
  const chat = chatPage?.sections;
  const brandName = brandDisplayName(branding);
  const logoUrl =
    resolveBrandingLogoUrl(branding?.logo_url, branding?.updated_at) ?? logoCanvas;

  const quickReplies = chat?.quickReplies ?? [];
  const botResponses = useMemo(() => chat?.responses ?? { default: "Happy to help plan your trip." }, [chat?.responses]);
  const greeting = chat?.greeting ?? `Welcome to ${brandName}! I'm your travel concierge.`;

  const whatsAppUrl = useMemo(
    () =>
      whatsAppLinkFromBranding(branding, {
        message: `Hello ${brandName}, I need help with a vehicle rental or trip plan.`,
      }),
    [branding, brandName],
  );

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ id: 0, from: "bot", text: greeting }]);
  }, [greeting]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "bot", text: getBotResponse(text, botResponses) },
      ]);
    }, 1100);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={[
              "fixed z-[70] flex flex-col chat-surface surface-panel border border-theme shadow-2xl overflow-hidden",
              "bottom-24 right-4 w-[calc(100vw-2rem)] max-w-sm h-[min(70vh,520px)]",
              "md:bottom-8 md:right-8",
            ].join(" ")}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-theme bg-primary/10">
              <div className="flex items-center gap-3">
                <img src={logoUrl} alt="" className="h-6 w-6 rounded-full object-contain bg-black/40 p-0.5" />
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider">{brandName}</p>
                  <p className="text-xs text-theme-muted">Travel concierge</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Minimize chat"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.from === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.from === "bot" ? "bg-primary/20 text-primary" : "bg-white/10"
                    }`}
                  >
                    {msg.from === "bot" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.from === "bot"
                        ? "bg-white/5 text-theme border border-theme"
                        : "bg-primary text-black font-medium"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex gap-2 items-center text-theme-muted text-xs pl-10">
                  <span className="animate-pulse">Concierge is typing…</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-3 pb-3 flex flex-wrap gap-2 border-t border-theme pt-3">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full border border-theme hover:border-primary/50 hover:text-primary transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-theme">
              {whatsAppUrl ? (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full h-12 items-center justify-center gap-2.5 rounded-full bg-[#25D366] text-white font-bold uppercase tracking-wider text-sm shadow-[0_4px_20px_rgba(37,211,102,0.35)] hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <FaWhatsapp className="h-5 w-5 shrink-0" aria-hidden />
                  Chat on WhatsApp
                </a>
              ) : (
                <p className="text-center text-xs text-theme-muted leading-relaxed px-2">
                  WhatsApp is not configured yet. Please{" "}
                  <Link href="/contact" className="text-primary hover:underline">
                    contact us
                  </Link>{" "}
                  instead.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[70] h-14 w-14 rounded-full bg-primary text-black shadow-[0_4px_24px_hsl(var(--primary)/0.5)] flex items-center justify-center hover:scale-105 transition-transform"
        aria-label={open ? "Close chat" : "Open chat"}
        whileTap={{ scale: 0.95 }}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-black" />
      </motion.button>
    </>
  );
}
