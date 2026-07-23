'use client'

import React, { useState } from 'react';
import { Settings as SettingsIcon, Building, CreditCard, Shield, Check } from 'lucide-react';

export default function SettingsPage({ darkMode = false }: { darkMode?: boolean }) {
  const [activeTab, setActiveTab] = useState('identity'); // 'identity' | 'billing' | 'security'

  const [brandName, setBrandName] = useState('Antigravity Studio');
  const [sector, setSector] = useState('Tech & Social Media');
  const [description, setDescription] = useState('Création de contenu assistée par Intelligence Artificielle et gestion multi-réseaux.');
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>({
    instagram: true,
    facebook: true,
    linkedin: true,
    twitter: false,
  });

  const toggleAccount = (key: string) => {
    setConnectedAccounts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex-1 h-full flex flex-col gap-4 overflow-y-auto no-scrollbar pb-6 select-none">
      
      {/* Top Header Card */}
      <div className={`rounded-2xl p-4 md:p-5 shadow-card-subtle border shrink-0 transition-colors duration-300 flex items-center justify-between ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-[#1677FF] dark:text-[#38BDF8] flex items-center justify-center">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold leading-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Paramètres & Configuration
            </h2>
            <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Gérez l'identité de votre marque, vos intégrations sociales et vos abonnements.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className={`flex items-center gap-4 px-2 border-b shrink-0 ${
        darkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        {[
          { id: 'identity', label: '1. Identité & Marque', icon: Building },
          { id: 'billing', label: '2. Abonnements & Plan', icon: CreditCard },
          { id: 'security', label: '3. Compte & Sécurité', icon: Shield },
        ].map((tab) => {
          const IconC = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 text-[13.5px] font-bold relative flex items-center gap-2 transition-all cursor-pointer bg-transparent border-none ${
                activeTab === tab.id
                  ? darkMode ? 'text-white' : 'text-[#1677FF]'
                  : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <IconC className="w-4 h-4" />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1677FF] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'identity' && (
        <div className="flex flex-col gap-4">
          <div className={`rounded-2xl p-5 shadow-card-subtle border flex flex-col gap-4 ${
            darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
          }`}>
            <h3 className={`text-[14px] font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Informations de la Marque Active
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`text-[12px] font-bold block mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Nom de la marque
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className={`w-full text-[13px] px-3.5 py-2.5 rounded-xl border outline-none ${
                    darkMode ? 'bg-[#0F172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className={`text-[12px] font-bold block mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Secteur d'activité
                </label>
                <input
                  type="text"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className={`w-full text-[13px] px-3.5 py-2.5 rounded-xl border outline-none ${
                    darkMode ? 'bg-[#0F172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`text-[12px] font-bold block mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Description de la marque
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full text-[13px] p-3 rounded-xl border outline-none ${
                  darkMode ? 'bg-[#0F172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          {/* Social Accounts Connections */}
          <div className={`rounded-2xl p-5 shadow-card-subtle border flex flex-col gap-4 ${
            darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
          }`}>
            <h3 className={`text-[14px] font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Comptes Réseaux Sociaux Connectés
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'instagram', name: 'Instagram', handle: '@antigravity_app' },
                { key: 'facebook', name: 'Facebook Page', handle: 'Antigravity Studio' },
                { key: 'linkedin', name: 'LinkedIn Company', handle: 'Antigravity Official' },
                { key: 'twitter', name: 'X / Twitter', handle: '@antigravity_io' },
              ].map((social) => {
                const isConn = connectedAccounts[social.key];
                return (
                  <div
                    key={social.key}
                    className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      darkMode ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className={`text-[13px] font-bold block ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                        {social.name}
                      </span>
                      <span className={`text-[11.5px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {social.handle}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleAccount(social.key)}
                      className={`px-3 py-1.5 rounded-lg text-[11.5px] font-bold transition-all cursor-pointer border-none ${
                        isConn
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400'
                          : 'bg-[#1677FF] text-white'
                      }`}
                    >
                      {isConn ? 'Connecté ✓' : 'Connecter'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Free', price: '0€ /mois', features: ['5 posts / mois', '1 marque', 'IA Basique'], current: false },
            { name: 'Pro CM Studio', price: '29€ /mois', features: ['Posts illimités', '3 marques', 'IA Gemini Avancée', 'Analytics & Calendrier'], current: true },
            { name: 'Business / Agency', price: '79€ /mois', features: ['Marques illimitées', 'Accès Équipe', 'Support prioritaire', 'API Intégration'], current: false },
          ].map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-5 shadow-card-subtle border flex flex-col justify-between gap-4 ${
                plan.current
                  ? 'border-[#1677FF] ring-2 ring-[#1677FF]/20 bg-blue-50/20 dark:bg-blue-500/10'
                  : darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100'
              }`}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1677FF]">
                  {plan.current ? 'Plan Actuel' : 'Abonnement'}
                </span>
                <h4 className={`text-lg font-extrabold mt-1 ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                  {plan.name}
                </h4>
                <p className="text-2xl font-black text-[#1677FF] mt-2">{plan.price}</p>

                <ul className="flex flex-col gap-2 mt-4 text-[12.5px]">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className={`w-full py-2.5 rounded-xl text-[12.5px] font-bold cursor-pointer transition-all border-none ${
                plan.current
                  ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white cursor-default'
                  : 'bg-[#1677FF] hover:bg-[#1266DF] text-white shadow-blue-glow'
              }`}>
                {plan.current ? 'Abonnement Actif' : 'Choisir ce plan'}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'security' && (
        <div className={`rounded-2xl p-5 shadow-card-subtle border flex flex-col gap-4 ${
          darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
        }`}>
          <h3 className={`text-[14px] font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
            Compte & Sécurité
          </h3>

          <div className="flex flex-col gap-3 max-w-md">
            <div>
              <label className={`text-[12px] font-bold block mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Mot de passe actuel
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full text-[13px] px-3.5 py-2.5 rounded-xl border outline-none ${
                  darkMode ? 'bg-[#0F172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div>
              <label className={`text-[12px] font-bold block mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Nouveau mot de passe
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full text-[13px] px-3.5 py-2.5 rounded-xl border outline-none ${
                  darkMode ? 'bg-[#0F172A] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <button className="bg-[#1677FF] hover:bg-[#1266DF] text-white text-[12.5px] font-bold py-2.5 px-4 rounded-xl cursor-pointer w-fit mt-2 border-none shadow-blue-glow">
              Mettre à jour le mot de passe
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
