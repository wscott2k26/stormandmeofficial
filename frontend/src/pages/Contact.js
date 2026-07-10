import React, { useState } from "react";
import { Send, Mail, CheckCircle2, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { submitContact } from "../lib/api";
import PageHero from "../components/PageHero";
import { GlowButton, SocialIcons } from "../components/shared";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const REASONS = ["General message", "Book question", "Music inquiry", "Merchandise support", "Interview request", "Podcast appearance", "Speaking engagement", "Media inquiry", "Business partnership", "Collaboration", "Website support", "Order support"];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", reason: "General message", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target ? e.target.value : e }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitContact(form);
      setSent(true);
      toast.success("Message sent");
    } catch { toast.error("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <PageHero overline="Contact" title="Let's Talk"
        subtitle="Questions, inquiries, collaborations, or just a hello—every message reaches Willy Will directly." />
      <section className="max-w-6xl mx-auto px-6 pb-24 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {sent ? (
            <div className="glass rounded-3xl p-12 text-center" data-testid="contact-confirmation">
              <CheckCircle2 className="w-14 h-14 text-storm-blue mx-auto" />
              <h2 className="font-display text-3xl font-bold text-white mt-5">Message Sent</h2>
              <p className="text-storm-silver/70 mt-3 font-light">Thank you for reaching out. Your message is on its way—I read every one. You'll hear back soon.</p>
              <div className="mt-8"><GlowButton onClick={() => { setSent(false); setForm({ name: "", email: "", phone: "", reason: "General message", subject: "", message: "" }); }} variant="secondary" data-testid="contact-send-another">Send Another</GlowButton></div>
            </div>
          ) : (
            <form onSubmit={submit} className="glass rounded-3xl p-8 space-y-5" data-testid="contact-form">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs tracking-widest uppercase text-storm-silver/50">Name</label>
                  <input required value={form.name} onChange={set("name")} data-testid="contact-name"
                    className="mt-2 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-white focus:outline-none focus:border-storm-blue/60" />
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-storm-silver/50">Email</label>
                  <input required type="email" value={form.email} onChange={set("email")} data-testid="contact-email"
                    className="mt-2 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-white focus:outline-none focus:border-storm-blue/60" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs tracking-widest uppercase text-storm-silver/50">Phone (optional)</label>
                  <input value={form.phone} onChange={set("phone")} data-testid="contact-phone"
                    className="mt-2 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-white focus:outline-none focus:border-storm-blue/60" />
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-storm-silver/50">Reason for contact</label>
                  <Select value={form.reason} onValueChange={(v) => setForm((f) => ({ ...f, reason: v }))}>
                    <SelectTrigger className="mt-2 bg-black/40 border-white/15 text-white" data-testid="contact-reason"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                      {REASONS.map((r) => <SelectItem key={r} value={r} data-testid={`reason-${r.toLowerCase().replace(/\s/g, "-")}`}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase text-storm-silver/50">Subject</label>
                <input required value={form.subject} onChange={set("subject")} data-testid="contact-subject"
                  className="mt-2 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-white focus:outline-none focus:border-storm-blue/60" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase text-storm-silver/50">Message</label>
                <textarea required rows={6} value={form.message} onChange={set("message")} data-testid="contact-message"
                  className="mt-2 w-full rounded-xl bg-black/40 border border-white/15 px-4 py-3 text-white focus:outline-none focus:border-storm-blue/60 resize-none" />
              </div>
              <label className="flex items-center gap-2 text-sm text-storm-silver/50 cursor-pointer">
                <Paperclip className="w-4 h-4" /> <span>Attach a file (optional)</span>
                <input type="file" className="hidden" data-testid="contact-file" />
              </label>
              <GlowButton onClick={submit} className="w-full" data-testid="contact-submit">{loading ? "Sending..." : "Send Message"} <Send className="w-4 h-4" /></GlowButton>
            </form>
          )}
        </div>
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <Mail className="w-6 h-6 text-storm-blue" />
            <h3 className="font-display text-lg font-bold text-white mt-3">Prefer email?</h3>
            <p className="text-storm-silver/70 text-sm mt-1 font-light">hello@stormandmeofficial.com</p>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold text-white">Follow the Journey</h3>
            <div className="mt-4"><SocialIcons /></div>
          </div>
        </div>
      </section>
    </div>
  );
}
