'use client';

import React, { useState, useEffect } from 'react';
import { Inquiry } from '@/lib/types';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { Mail, Clock, CheckCircle2, User, Sparkles, Send } from 'lucide-react';

export default function InquiriesInboxPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  useEffect(() => {
    fetch('/api/inquiries')
      .then((res) => res.json())
      .then((data) => {
        if (data.inquiries) {
          setInquiries(data.inquiries);
          if (data.inquiries.length > 0) {
            setSelectedInquiry(data.inquiries[0]);
          }
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-8 pb-20">
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
          Client Communication
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-display">
          Inquiries Inbox ({inquiries.length})
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Direct messages and project inquiries sent through your portfolio contact form.
        </p>
      </div>

      {inquiries.length === 0 ? (
        <GlassCard intensity="high" className="p-12 text-center text-zinc-500 dark:text-zinc-400 space-y-3">
          <Mail className="w-10 h-10 mx-auto text-emerald-500/40" />
          <h3 className="text-base font-bold text-foreground">Your Inbox is Clear</h3>
          <p className="text-xs max-w-sm mx-auto">
            When visitors submit inquiries through your portfolio contact section, their messages will appear here.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Message List */}
          <div className="lg:col-span-5 space-y-3">
            {inquiries.map((inq) => {
              const isSelected = selectedInquiry?.id === inq.id;
              return (
                <div
                  key={inq.id}
                  onClick={() => setSelectedInquiry(inq)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 space-y-1.5 ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500 text-foreground shadow-glass-glow'
                      : 'bg-card-bg border-border hover:border-emerald-500/40 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">{inq.senderName}</span>
                    <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 truncate font-semibold">
                    {inq.senderSubject || 'General Inquiry'}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">{inq.message}</p>
                </div>
              );
            })}
          </div>

          {/* Right: Message Detail */}
          <div className="lg:col-span-7">
            {selectedInquiry ? (
              <GlassCard intensity="ultra" glow className="p-6 space-y-6">
                <div className="border-b border-border pb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">
                      Message Details
                    </span>
                    <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                      {new Date(selectedInquiry.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground font-display">
                    {selectedInquiry.senderSubject || 'Direct Inquiry'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-700 dark:text-zinc-300">
                    <span className="flex items-center gap-1 font-semibold">
                      <User className="w-3.5 h-3.5 text-emerald-500" /> {selectedInquiry.senderName}
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      &lt;{selectedInquiry.senderEmail}&gt;
                    </span>
                  </div>
                </div>

                {selectedInquiry.serviceInterest && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                    Target Package: <strong>{selectedInquiry.serviceInterest}</strong>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 block">Message Body</span>
                  <div className="p-4 rounded-xl bg-black/5 dark:bg-black/40 border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`mailto:${selectedInquiry.senderEmail}?subject=Re: ${encodeURIComponent(selectedInquiry.senderSubject || 'Your Inquiry')}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-500 text-white dark:text-black shadow-glass-glow transition-all"
                  >
                    <Send className="w-3.5 h-3.5" /> Reply Directly via Email
                  </a>
                </div>
              </GlassCard>
            ) : (
              <div className="p-12 text-center text-zinc-500">Select an inquiry to view details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
