'use client'

import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Building, CreditCard, Shield, Check, Lock } from 'lucide-react';
import { useTheme } from '@/components/context/ThemeContext';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/components/context/UserContext';
import { useOrg } from '@/components/context/OrgContext';

export default function SettingsPage({ darkMode: propDarkMode }: { darkMode?: boolean }) {
  const { darkMode: ctxDarkMode } = useTheme();
  const darkMode = propDarkMode ?? ctxDarkMode;
  const { user } = useUser();
  const { activeOrganization } = useOrg();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState('identity'); // 'identity' | 'billing' | 'security'
  const [brandName, setBrandName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (activeOrganization) {
      setBrandName(activeOrganization.name || '');
    }
  }, [activeOrganization]);

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization || !brandName.trim()) return;

    await supabase.from('organizations').update({ name: brandName.trim() }).eq('id', activeOrganization.id);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setUpdatingPassword(false);

    if (error) {
      alert(`Erreur: ${error.message}`);
    } else {
      setNewPassword('');
      alert('Mot de passe mis à jour avec succès !');
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col gap-4 overflow-y-auto no-scrollbar select-none pb-6">
      
      {/* Top Header Card */}
      <div className={`rounded-2xl p-4 md:p-5 shadow-card-subtle border shrink-0 transition-colors duration-300 flex items-center justify-between ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[#1677FF] dark:text-[#38BDF8]">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-base font-bold leading-tight ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
              Paramètres de l'Organisation & Profil
            </h2>
            <p className={`text-[12px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Gérez votre marque, votre abonnement et vos paramètres de sécurité.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex items-center gap-4 px-2 border-b shrink-0 ${
        darkMode ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <button
          onClick={() => setActiveTab('identity')}
          className={`py-2 text-[13.5px] font-bold relative transition-all cursor-pointer bg-transparent border-none flex items-center gap-2 ${
            activeTab === 'identity'
              ? darkMode ? 'text-white' : 'text-[#1677FF]'
              : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Identité de la Marque</span>
          {activeTab === 'identity' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1677FF] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`py-2 text-[13.5px] font-bold relative transition-all cursor-pointer bg-transparent border-none flex items-center gap-2 ${
            activeTab === 'billing'
              ? darkMode ? 'text-white' : 'text-[#1677FF]'
              : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Abonnement & Facturation</span>
          {activeTab === 'billing' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1677FF] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`py-2 text-[13.5px] font-bold relative transition-all cursor-pointer bg-transparent border-none flex items-center gap-2 ${
            activeTab === 'security'
              ? darkMode ? 'text-white' : 'text-[#1677FF]'
              : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Sécurité & Compte</span>
          {activeTab === 'security' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#1677FF] rounded-full" />
          )}
        </button>
      </div>

      {/* Main Tab Content */}
      <div className={`rounded-2xl p-4 md:p-6 shadow-card-subtle border transition-colors duration-300 ${
        darkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-white border-slate-100/80'
      }`}>
        
        {/* Identity Tab */}
        {activeTab === 'identity' && (
          <form onSubmit={handleSaveBrand} className="flex flex-col gap-4 max-w-lg">
            <div>
              <label className={`text-[12.5px] font-bold block mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Nom de l'organisation / Marque active :
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className={`w-full text-[13.5px] p-3 rounded-xl border outline-none ${
                  darkMode 
                    ? 'bg-[#0F172A] border-slate-700 text-white focus:border-[#1677FF]' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#1677FF] focus:bg-white'
                }`}
              />
            </div>

            <div>
              <label className={`text-[12.5px] font-bold block mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Adresse Email associée :
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'alexandra.borke@cmstudio.com'}
                className="w-full text-[13.5px] p-3 rounded-xl border opacity-70 bg-slate-100 dark:bg-slate-800 dark:border-slate-700 text-slate-500"
              />
            </div>

            <button
              type="submit"
              className="bg-[#1677FF] hover:bg-[#1266DF] text-white text-[13px] font-bold py-2.5 px-5 rounded-xl shadow-blue-glow cursor-pointer border-none transition-all w-fit flex items-center gap-2"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{savedSuccess ? 'Modifications enregistrées !' : 'Enregistrer la marque'}</span>
            </button>
          </form>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="flex flex-col gap-4 max-w-lg">
            <div className="p-4 rounded-xl border bg-blue-50/50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1677FF] dark:text-[#38BDF8]">
                  Formule Actuelle
                </span>
                <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                  CM Studio Pro (Illimité)
                </h4>
                <p className="text-[12px] text-slate-500">Renouvellement le 1er Août 2026</p>
              </div>
              <span className="bg-[#1677FF] text-white text-[12px] font-bold px-3 py-1 rounded-full">
                Actif
              </span>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-lg">
            <div>
              <label className={`text-[12.5px] font-bold block mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Nouveau mot de passe :
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6 caractères minimum"
                className={`w-full text-[13.5px] p-3 rounded-xl border outline-none ${
                  darkMode 
                    ? 'bg-[#0F172A] border-slate-700 text-white focus:border-[#1677FF]' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#1677FF] focus:bg-white'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword || !newPassword}
              className="bg-[#1677FF] hover:bg-[#1266DF] text-white text-[13px] font-bold py-2.5 px-5 rounded-xl shadow-blue-glow cursor-pointer border-none transition-all w-fit flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{updatingPassword ? 'Mise à jour...' : 'Changer mon mot de passe'}</span>
            </button>
          </form>
        )}

      </div>

    </div>
  );
}
