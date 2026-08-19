'use client'

import React from 'react'
import { Users, CheckCircle2, MessageSquare, Flame, Lightbulb, Sparkles } from 'lucide-react'

export function CommunityHubSection() {
  return (
    <section className="py-16 sm:py-20 bg-slate-50/70 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Left: Real App Screenshot */}
          <div className="order-2 lg:order-1 relative rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden p-2 sm:p-2.5">
            <div className="h-8 px-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              </div>
              <div className="text-[10px] font-mono text-slate-300">
                app.cmstudio.ai/community
              </div>
              <div className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                28 membres en ligne
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-slate-800 aspect-[16/10] bg-slate-900">
              <img
                src="/images/real-app/app_community.png"
                alt="CM Studio - Hub communautaire et réseau des community managers"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>

          {/* Right: Text & Key Arguments */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-xs font-bold text-purple-600 mb-3 border border-purple-200/80">
              <Users className="w-3.5 h-3.5" />
              <span>Réseau &amp; Entraide Professionnelle</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A] tracking-tight mb-4">
              Le premier espace d'entraide dédié aux Community Managers.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
              Ne travaillez plus isolé. Partagez vos meilleurs prompts, échangez sur les dernières mises à jour d'algorithmes et collaborez en temps réel avec des professionnels du secteur.
            </p>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Partage de templates &amp; hooks :</strong> Découvrez les structures de posts qui génèrent le plus de clics ce mois-ci.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Veille algorithmique continue :</strong> Des alertes sur les changements de portée LinkedIn, Meta et TikTok.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span><strong>Réseau actif :</strong> Posez vos questions et obtenez des retours d'expérience de pairs en direct.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
