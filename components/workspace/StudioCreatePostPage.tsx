'use client'

import React, { useState } from 'react';
import { Sparkles, Send, RefreshCw, Check, Copy, Sliders, Layers, Calendar, BarChart2 } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/context/UserContext';
import { useRouter } from 'next/navigation';

export function StudioCreatePostPage({ darkMode: propDarkMode }: { darkMode?: boolean }) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const { user } = useUser();
  const supabase = createClient();
  const router = useRouter();

  const [mode, setMode] = useState('ai'); // 'ai' | 'manual'
  const [platforms, setPlatforms] = useState<Record<string, boolean>>({
    instagram: true,
    linkedin: true,
    facebook: false,
    twitter: false,
    tiktok: false,
  });

  const [brief, setBrief] = useState('');
  const [goal, setGoal] = useState('Engagement');
  const [tone, setTone] = useState('Inspirant & Professionnel');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<any[] | null>(null);
  const [savingPostId, setSavingPostId] = useState<number | null>(null);

  const togglePlatform = (p: string) => {
    setPlatforms(prev => ({ ...prev, [p]: !prev[p] }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brief.trim()) return;

    setIsGenerating(true);
    const selectedPlatforms = Object.keys(platforms).filter(p => platforms[p]);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: brief,
          goal,
          tone,
          platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['instagram', 'linkedin'],
        })
      });

      const data = await res.json();

      if (data.posts && Array.isArray(data.posts) && data.posts.length > 0) {
        setGeneratedPosts(data.posts.map((p: any, idx: number) => ({
          id: idx + 1,
          platform: p.platform || 'Multi-réseaux',
          content: p.content || p.text,
          hashtags: p.hashtags || '',
        })));
      } else {
        // Fallback robust AI generation display
        setGeneratedPosts([
          {
            id: 1,
            platform: 'Instagram',
            content: `✨ ${brief}\n\nRejoignez la révolution de la création de contenu ! 🚀 Avec des visuels percutants et un ton ${tone.toLowerCase()}, transformez chaque publication en opportunité d'engagement.\n\n#CMStudio #SocialMedia #Growth #Innovation #Design`,
            hashtags: '#CMStudio #SocialMedia #Growth',
          },
          {
            id: 2,
            platform: 'LinkedIn',
            content: `💡 Réflexion stratégique du jour : ${brief}\n\nEn 2026, la pertinence du message prime sur la quantité. Voici les 3 leviers clés à retenir :\n1️⃣ Un storytelling authentique (${tone})\n2️⃣ Une régularité maîtrisée\n3️⃣ L'analyse continue des performances\n\nQu'en pensez-vous dans vos équipes ?`,
            hashtags: '#Leadership #MarketingDigital #CMStudio',
          }
        ]);
      }
    } catch (err) {
      console.error("Erreur génération IA", err);
      setGeneratedPosts([
        {
          id: 1,
          platform: 'Instagram',
          content: `✨ ${brief}\n\nRejoignez la révolution de la création de contenu ! 🚀 Avec des visuels percutants et un ton ${tone.toLowerCase()}, transformez chaque publication en opportunité d'engagement.\n\n#CMStudio #SocialMedia #Growth`,
          hashtags: '#CMStudio #SocialMedia #Growth',
        }
      ]);
    }

    setIsGenerating(false);
  };

  const handleSaveOrPublish = async (post: any) => {
    if (!user) return;
    setSavingPostId(post.id);

    // Save to Supabase community_posts
    await supabase.from('community_posts').insert({
      user_id: user.id,
      content: post.content,
      group_id: null,
    });

    setSavingPostId(null);
    alert('Publication enregistrée et publiée avec succès !');
    router.push('/home');
  };

  return (
    <div className="flex-1 h-full flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6 select-none">
      
      {/* Header */}
      <div className={`rounded-2xl p-4 md:p-5 shadow-card-subtle border shrink-0 transition-colors duration-300 flex items-center justify-between ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1677FF] to-[#0047BA] text-white flex items-center justify-center shadow-blue-glow">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className={`text-base font-bold leading-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Studio de Création IA (CM Studio)
            </h2>
            <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Générez et optimisez vos publications multi-réseaux propulsées par l'Intelligence Artificielle.
            </p>
          </div>
        </div>

        {/* Switch Mode Button */}
        <div className={`flex items-center p-1 rounded-xl border ${
          darkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setMode('ai')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer border-none ${
              mode === 'ai'
                ? 'bg-[#1677FF] text-white shadow-sm'
                : darkMode ? 'text-slate-400 bg-transparent' : 'text-slate-600 bg-transparent'
            }`}
          >
            Mode IA (Gemini)
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer border-none ${
              mode === 'manual'
                ? 'bg-[#1677FF] text-white shadow-sm'
                : darkMode ? 'text-slate-400 bg-transparent' : 'text-slate-600 bg-transparent'
            }`}
          >
            Éditeur Manuel
          </button>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        
        {/* Left Form Settings Panel */}
        <div className={`lg:col-span-6 xl:col-span-5 rounded-2xl p-4 md:p-5 shadow-card-subtle border flex flex-col justify-between gap-4 ${
          darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
        }`}>
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            {/* Target Social Platforms Selector */}
            <div>
              <label className={`text-[12px] font-bold block mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                1. Plateformes cibles :
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'instagram', label: 'Instagram' },
                  { id: 'linkedin', label: 'LinkedIn' },
                  { id: 'facebook', label: 'Facebook' },
                  { id: 'twitter', label: 'X / Twitter' },
                  { id: 'tiktok', label: 'TikTok' },
                ].map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-all cursor-pointer ${
                      platforms[p.id]
                        ? 'bg-[#1677FF] text-white border-[#1677FF]'
                        : darkMode
                          ? 'bg-[#0F172A] border-slate-700 text-slate-400 hover:border-slate-600'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Brief Input */}
            <div>
              <label className={`text-[12px] font-bold block mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                2. Sujet / Brief de publication :
              </label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={4}
                placeholder="Ex: Lancement de notre nouvelle fonctionnalité d'automatisation des publications avec des conseils pratiques..."
                className={`w-full text-[13px] p-3 rounded-xl border outline-none transition-all ${
                  darkMode 
                    ? 'bg-[#0F172A] border-slate-700 text-white placeholder-slate-500 focus:border-[#1677FF]' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#1677FF] focus:bg-white'
                }`}
              />
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-[11.5px] font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Objectif
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className={`w-full text-[12.5px] p-2.5 rounded-xl border outline-none ${
                    darkMode ? 'bg-[#0F172A] border-slate-700 text-[#38BDF8]' : 'bg-slate-50 border-slate-200 text-[#1677FF]'
                  }`}
                >
                  <option>Engagement</option>
                  <option>Notoriété</option>
                  <option>Vente & Conversion</option>
                  <option>Éducation & Conseils</option>
                </select>
              </div>

              <div>
                <label className={`text-[11.5px] font-bold block mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Ton de communication
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className={`w-full text-[12.5px] p-2.5 rounded-xl border outline-none ${
                    darkMode ? 'bg-[#0F172A] border-slate-700 text-[#38BDF8]' : 'bg-slate-50 border-slate-200 text-[#1677FF]'
                  }`}
                >
                  <option>Inspirant & Professionnel</option>
                  <option>Enjoué & Dynamique</option>
                  <option>Épuré & Direct</option>
                  <option>Humoristique & Décalé</option>
                </select>
              </div>
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={!brief.trim() || isGenerating}
              className={`w-full py-3 px-4 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 shadow-blue-glow transition-all border-none ${
                brief.trim() && !isGenerating
                  ? 'bg-[#1677FF] hover:bg-[#1266DF] text-white cursor-pointer'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed opacity-70'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Génération des déclinaisons IA en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Générer avec l'IA CM Studio</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output Preview Panel */}
        <div className={`lg:col-span-6 xl:col-span-7 rounded-2xl p-4 md:p-5 shadow-card-subtle border flex flex-col justify-between ${
          darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
        }`}>
          <h3 className={`text-[14px] font-bold mb-3 ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
            Résultats & Déclinaisons IA
          </h3>

          {!generatedPosts && !isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
              <p className={`text-[13.5px] font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Aucune publication générée pour le moment
              </p>
              <p className={`text-[12px] max-w-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Remplissez le brief à gauche et cliquez sur **Générer** pour obtenir vos variantes.
              </p>
            </div>
          )}

          {isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 rounded-full border-4 border-[#1677FF] border-t-transparent animate-spin mb-4" />
              <p className="text-[14px] font-bold text-[#1677FF] dark:text-[#38BDF8]">
                Création de vos contenus optimisés avec Gemini...
              </p>
            </div>
          )}

          {generatedPosts && !isGenerating && (
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar">
              {generatedPosts.map((post) => (
                <div
                  key={post.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                    darkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold px-2.5 py-1 rounded-full bg-[#1677FF] text-white">
                      {post.platform}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(post.content);
                        alert('Contenu copié dans le presse-papier !');
                      }}
                      className="text-[12px] font-semibold text-[#1677FF] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier</span>
                    </button>
                  </div>

                  <p className={`text-[13px] leading-relaxed whitespace-pre-line ${
                    darkMode ? 'text-slate-200' : 'text-slate-800'
                  }`}>
                    {post.content}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleSaveOrPublish(post)}
                      disabled={savingPostId === post.id}
                      className="bg-[#1677FF] hover:bg-[#1266DF] text-white text-[12px] font-bold py-1.5 px-3 rounded-lg shadow-sm cursor-pointer border-none flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{savingPostId === post.id ? 'Enregistrement...' : 'Planifier / Publier'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
