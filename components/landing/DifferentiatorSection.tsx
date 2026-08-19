'use client'

import React from 'react'
import { CheckCircle2, XCircle, Sparkles, SlidersHorizontal } from 'lucide-react'

export function DifferentiatorSection() {
  return (
    <section id="comparaison" className="py-20 bg-slate-50/60 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-xs font-bold text-[#1677FF] mb-3 border border-blue-200/80">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Différenciation technique
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif] text-[#0F172A] tracking-tight">
            Pourquoi les outils de "repurposing" générique échouent là où nous convertissons.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed">
            La plupart des outils prennent un texte, le résument et le distribuent partout. CM Studio applique des <strong className="text-slate-900 font-semibold">règles narratives et algorithmiques propres à chaque réseau social</strong>.
          </p>
        </div>

        {/* 2 Piliers Algorithmiques (Facebook vs LinkedIn) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded bg-[#1877F2] text-white flex items-center justify-center font-bold text-[10px]">
                FB
              </span>
              <h3 className="text-sm font-bold text-[#0F172A]">Sur Facebook</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              L'algorithme tronque votre texte après environ 125 caractères. Les deux premières lignes sont rédigées selon les frameworks <strong className="text-slate-900 font-semibold">AIDA, PAS ou BAB</strong> pour forcer le clic sur <em>"Voir plus"</em>.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded bg-[#0A66C2] text-white flex items-center justify-center font-bold text-[10px]">
                IN
              </span>
              <h3 className="text-sm font-bold text-[#0F172A]">Sur LinkedIn</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Le lecteur cherche de l'expertise condensée ou une histoire incarnée. Le hook fait 1 à 2 lignes percutantes, suivi d'une structure dédiée (<strong className="text-slate-900 font-semibold">Analyse de cas, Conseil actionnable, Liste argumentée ou Storytelling de terrain</strong>).
            </p>
          </div>
        </div>

        {/* Démonstration concrète Avant / Après */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#38BDF8]" />
              <span className="text-xs sm:text-sm font-bold">Démonstration concrète sur un sujet neutre :</span>
            </div>
            <span className="text-xs text-slate-300 font-mono bg-white/10 px-2.5 py-1 rounded-md">
              Sujet : Le lancement d'un nouveau modèle d'abonnement sans engagement.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* Colonne 1: ❌ Générateur classique */}
            <div className="p-5 sm:p-6 bg-rose-50/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
                    ❌ Ce que produit un générateur IA classique
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mb-3 italic">
                  (Repurposing générique)
                </div>
                <div className="p-4 rounded-xl bg-white border border-red-200/80 text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-line shadow-2xs">
{`🚀 Grande nouvelle ! Nous sommes ravis de vous annoncer le lancement de notre nouvelle offre sans engagement ! 🎉 

Profitez dès maintenant de nos services en toute liberté. 

Rendez-vous sur notre site web pour en savoir plus. 

#Innovation #Nouveauté #Business #Success`}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-red-100 text-[11px] text-red-700 font-medium italic">
                Résultat : vocabulaire cliché, émojis décoratifs inutiles, aucun hook, ignoré par 99% des utilisateurs.
              </div>
            </div>

            {/* Colonne 2: ✅ CM Studio LinkedIn */}
            <div className="p-5 sm:p-6 bg-blue-50/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-[#0A66C2] shrink-0" />
                  <span className="text-xs font-bold text-[#0A66C2] uppercase tracking-wide">
                    ✅ Ce que produit CM Studio pour LinkedIn
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mb-3 italic">
                  (Framework Storytelling / Insight)
                </div>
                <div className="p-4 rounded-xl bg-white border border-blue-200/80 text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-line shadow-2xs">
{`On a failli perdre notre plus gros client le mois dernier.

La raison ? Un contrat d'engagement de 12 mois qu'il refusait de signer.

Il adorait notre produit, mais détestait être enfermé. 
On a fait ce que beaucoup d'agences refusent de faire : 
on a supprimé la clause d'engagement pour tout le monde.

Voici ce qui s'est passé 30 jours plus tard :
→ +28% de conversions à l'inscription
→ Un taux de rétention identique
→ 0 friction commerciale à la signature

La rétention ne se gagne pas par un contrat juridique. 
Elle se gagne sur la valeur délivrée chaque semaine.

Vous fonctionnez avec ou sans engagement chez vous ?`}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-100 text-[11px] text-[#0A66C2] font-semibold">
                ✓ Hook narratif • Chiffres concrets • Question d'engagement B2B
              </div>
            </div>

            {/* Colonne 3: ✅ CM Studio Facebook */}
            <div className="p-5 sm:p-6 bg-emerald-50/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-[#1877F2] shrink-0" />
                  <span className="text-xs font-bold text-[#1877F2] uppercase tracking-wide">
                    ✅ Ce que produit CM Studio pour Facebook
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mb-3 italic">
                  (Framework PAS — Hook &lt; 125 caractères)
                </div>
                <div className="p-4 rounded-xl bg-white border border-emerald-200/80 text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-line shadow-2xs">
{`Payer un abonnement pendant 12 mois pour un outil qu'on n'utilise plus au bout de 3 semaines... la pire sensation ?

On a tous connu ça. C'est pour cette raison qu'on a décidé de changer les règles.

À partir d'aujourd'hui, toutes nos formules passent en accès 100% libre, sans aucun engagement de durée. Vous restez tant que le produit vous rapporte. Vous partez en un clic si ce n'est plus le cas.

Découvrez les nouvelles formules commentées en détail sur le lien ci-dessous 👇`}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-100 text-[11px] text-[#1877F2] font-semibold">
                ✓ Hook sous les 125 caractères • Forçage du "Voir plus" • Clic CTA
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
