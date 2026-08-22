'use client';

import React, { useState, useEffect } from 'react';
import { UserPortfolio, ServiceItem } from '@/lib/types';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassInput, GlassTextarea } from '@/components/ui/glass-input';
import { Plus, Trash2, Save, CheckCircle2, Clock, DollarSign, Sliders, Sparkles } from 'lucide-react';

export default function ServicesPricingPage() {
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/portfolio')
      .then((res) => res.json())
      .then((data) => {
        if (data.portfolio) setPortfolio(data.portfolio);
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    if (!portfolio) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portfolio),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddService = () => {
    if (!portfolio) return;
    const newService: ServiceItem = {
      id: `srv_${Date.now()}`,
      title: 'New Service Package',
      description: 'Describe what you deliver in this engagement package.',
      priceFormatted: '₦500,000',
      billingType: 'fixed',
      deliveryTime: '2 Weeks',
      features: ['Deliverable 1', 'Deliverable 2', 'Weekly Updates'],
      popular: false,
      ctaText: 'Inquire Package',
      order: (portfolio.services?.length || 0) + 1,
    };
    setPortfolio({
      ...portfolio,
      services: [...(portfolio.services || []), newService],
    });
  };

  const handleDeleteService = (id: string) => {
    if (!portfolio) return;
    setPortfolio({
      ...portfolio,
      services: portfolio.services.filter((s) => s.id !== id),
    });
  };

  if (!portfolio) {
    return (
      <div className="py-24 text-center text-zinc-400">
        <Sparkles className="w-8 h-8 mx-auto text-emerald-400 animate-spin mb-3" />
        <p>Loading Services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
            Monetization Matrix
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-display">
            Services & Pricing Packages
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Define your service offerings with custom rates (NGN/USD), deliverable timelines, and features.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Published
            </span>
          )}
          <GlassButton variant="secondary" size="sm" onClick={handleAddService} className="text-xs font-bold">
            <Plus className="w-3.5 h-3.5" /> Add Package
          </GlassButton>
          <GlassButton variant="primary" size="sm" glow loading={isSaving} onClick={handleSave} className="text-xs font-bold">
            <Save className="w-3.5 h-3.5" /> Save Changes
          </GlassButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {portfolio.services?.map((service) => (
          <GlassCard key={service.id} intensity="high" className="p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <GlassInput
                  label="Service Name"
                  value={service.title}
                  onChange={(e) => {
                    const updated = portfolio.services.map((s) =>
                      s.id === service.id ? { ...s, title: e.target.value } : s
                    );
                    setPortfolio({ ...portfolio, services: updated });
                  }}
                />
                <GlassTextarea
                  label="Scope Description"
                  rows={2}
                  value={service.description}
                  onChange={(e) => {
                    const updated = portfolio.services.map((s) =>
                      s.id === service.id ? { ...s, description: e.target.value } : s
                    );
                    setPortfolio({ ...portfolio, services: updated });
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleDeleteService(service.id)}
                className="text-zinc-500 hover:text-rose-400 p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <GlassInput
                label="Price (Formatted)"
                placeholder="e.g. ₦1,500,000"
                value={service.priceFormatted}
                onChange={(e) => {
                  const updated = portfolio.services.map((s) =>
                    s.id === service.id ? { ...s, priceFormatted: e.target.value } : s
                  );
                  setPortfolio({ ...portfolio, services: updated });
                }}
              />
              <GlassInput
                label="Delivery Timeline"
                placeholder="e.g. 2 - 3 Weeks"
                value={service.deliveryTime}
                onChange={(e) => {
                  const updated = portfolio.services.map((s) =>
                    s.id === service.id ? { ...s, deliveryTime: e.target.value } : s
                  );
                  setPortfolio({ ...portfolio, services: updated });
                }}
              />
            </div>

            {/* Feature Bullets */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                Deliverables / Feature Bullets (Comma Separated)
              </label>
              <GlassInput
                value={service.features?.join(', ') || ''}
                onChange={(e) => {
                  const items = e.target.value.split(',').map((f) => f.trim());
                  const updated = portfolio.services.map((s) =>
                    s.id === service.id ? { ...s, features: items } : s
                  );
                  setPortfolio({ ...portfolio, services: updated });
                }}
              />
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={service.popular}
                  onChange={(e) => {
                    const updated = portfolio.services.map((s) =>
                      s.id === service.id ? { ...s, popular: e.target.checked } : s
                    );
                    setPortfolio({ ...portfolio, services: updated });
                  }}
                  className="w-4 h-4 accent-emerald-400 rounded"
                />
                <span>Highlight as &apos;Most Popular&apos;</span>
              </label>

              <GlassInput
                placeholder="CTA Text (e.g. Book Sprint)"
                value={service.ctaText || ''}
                onChange={(e) => {
                  const updated = portfolio.services.map((s) =>
                    s.id === service.id ? { ...s, ctaText: e.target.value } : s
                  );
                  setPortfolio({ ...portfolio, services: updated });
                }}
                className="max-w-[180px] text-xs py-1.5"
              />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
