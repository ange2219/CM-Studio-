'use client'

import React, { useState } from 'react'
import { HelpCircle, ChevronDown } from 'lucide-react'

export function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqItems = [
    {
      q: "Est-ce que CM Studio remplace le travail d'un Community Manager ?",
      a: "Non. CM Studio agit comme un assistant de production ultra-qualifié. Il prend en charge 80% du travail chronophage (la recherche d'angles, le premier jet rédigé selon les bons frameworks, le formatage aux normes de chaque réseau et la planification). Vous gardez le contrôle total sur la relecture, l'alignement stratégique et la validation finale.",
    },
    {
      q: "Mes données et celles de mes clients sont-elles isolées et confidentielles ?",
      a: "Oui, strictement. Chaque marque ou client possède son propre espace organisationnel hermétique. Les lignes éditoriales, personas, historiques de génération et données analytiques de la marque A ne sont jamais croisés ni partagés avec la marque B. Vos données ne sont pas non plus utilisées pour entraîner des modèles publics.",
    },
    {
      q: "Les comptes sociaux connectés sont-ils sécurisés ?",
      a: "Oui. Les connexions aux plateformes sociales s'effectuent exclusivement via les API officielles (OAuth standard sécurisé) d'Instagram, Facebook, LinkedIn et TikTok. CM Studio ne stocke jamais vos mots de passe et ne demande que les permissions strictement requises pour la publication et l'analyse.",
    },
    {
      q: "En quoi est-ce différent d'un abonnement ChatGPT Plus ou d'un outil comme Predis.ai ?",
      a: "ChatGPT génère du texte brut sans connaître les contraintes d'affichage précises de chaque réseau (comme la coupure des 125 caractères sur Facebook ou les formats de posts LinkedIn). Les outils de repurposing générique, quant à eux, appliquent le même texte partout. CM Studio applique des prompts narratifs structurés (AIDA, BAB, Storytelling) et une segmentation par réseau qui maximisent l'engagement réel.",
    },
    {
      q: "Puis-je annuler ou modifier mon abonnement à tout moment ?",
      a: "Oui, sans condition. Tous les forfaits sont sans engagement. Vous pouvez changer de formule, mettre en pause ou résilier votre abonnement directement depuis les paramètres de votre compte en un seul clic.",
    },
  ]

  return (
    <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header de section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-xs font-bold text-blue-400 mb-3 border border-blue-500/30">
          <HelpCircle className="w-3.5 h-3.5" />
          FAQ
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-white tracking-tight">
          Foire Aux Questions
        </h2>
      </div>

      {/* Accordéon interactif */}
      <div className="space-y-3">
        {faqItems.map((item, index) => {
          const isOpen = openFaq === index
          return (
            <div
              key={index}
              className="rounded-xl bg-[#0F172A] border border-slate-800 overflow-hidden transition-all shadow-xl"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 text-sm sm:text-base font-bold text-white hover:text-[#38BDF8] transition-colors cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-[#38BDF8]' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800">
                  {item.a}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
