'use client';

import { useState, useEffect } from 'react';
import { Settings, Shield, Server, Volume2, Moon, Sun, Save, Check, RefreshCw, Cpu } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { LANGUAGES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { preferences, updatePreferences } = useUser();
  const { isDark, toggleTheme } = useTheme();
  const [localPrefs, setLocalPrefs] = useState({
    apiUrl: 'http://localhost:3001',
    speechEngine: 'vosk_whisper',
    defaultLanguage: 'javascript',
    synthesize: true,
    autoSave: true,
    notifications: true
  });
  const [developerName, setDeveloperName] = useState('Developer');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(prev => ({ ...prev, ...preferences }));
    }
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('voxcode-developer-name') || 'Developer';
      setDeveloperName(name);
      const url = localStorage.getItem('voxcode-api-url') || 'http://localhost:3001';
      setLocalPrefs(prev => ({ ...prev, apiUrl: url }));
    }
  }, [preferences]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    updatePreferences(localPrefs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('voxcode-developer-name', developerName);
      localStorage.setItem('voxcode-api-url', localPrefs.apiUrl);
    }
    setTimeout(() => {
      setIsSaving(false);
      showToast('Settings saved successfully!');
    }, 400);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl animate-fadeIn">
      {toast && <div className="toast toast-success">{toast}</div>}

      <div className="space-y-1">
        <Breadcrumb items={[{ label: 'Settings' }]} />
        <h1 className="text-2xl font-bold text-primary font-display flex items-center gap-2">
          <Settings className="w-6 h-6 text-accent-violet" />
          <span>Workspace & Engine Settings</span>
        </h1>
        <p className="text-xs text-secondary">Configure local AI endpoints, speech recognition models, and developer identity.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Developer Profile */}
        <div className="surface-card p-6 bg-elevated border border-light rounded-xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-light pb-3">
            <Shield className="w-4 h-4 text-accent-emerald" />
            <span>Developer Identity</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Developer Display Name</label>
              <input
                type="text"
                value={developerName}
                onChange={(e) => setDeveloperName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-secondary border border-light rounded-lg text-primary focus:outline-none focus:border-focus"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Workspace Environment</label>
              <input
                type="text"
                disabled
                value="Local Offline Pro Studio (Port 3001)"
                className="w-full px-3 py-2 text-xs bg-tertiary border border-light rounded-lg text-secondary cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Backend API & Speech Pipeline */}
        <div className="surface-card p-6 bg-elevated border border-light rounded-xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-light pb-3">
            <Server className="w-4 h-4 text-accent-violet" />
            <span>AI Backend & Speech Pipeline</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Backend API Server URL</label>
              <input
                type="text"
                value={localPrefs.apiUrl}
                onChange={(e) => setLocalPrefs({ ...localPrefs, apiUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-secondary border border-light rounded-lg text-primary focus:outline-none focus:border-focus"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Speech Recognition Engine</label>
              <select
                value={localPrefs.speechEngine}
                onChange={(e) => setLocalPrefs({ ...localPrefs, speechEngine: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-secondary border border-light rounded-lg text-primary focus:outline-none focus:border-focus"
              >
                <option value="vosk_whisper">Vosk (Real-time) + Whisper (Final)</option>
                <option value="vosk_only">Vosk Only (Ultra Low Latency)</option>
                <option value="browser_api">Browser WebSpeech API (Fallback)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Studio Preferences */}
        <div className="surface-card p-6 bg-elevated border border-light rounded-xl shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2 border-b border-light pb-3">
            <Cpu className="w-4 h-4 text-accent-blue" />
            <span>Studio Preferences</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Default Programming Language</label>
              <select
                value={localPrefs.defaultLanguage}
                onChange={(e) => setLocalPrefs({ ...localPrefs, defaultLanguage: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-secondary border border-light rounded-lg text-primary focus:outline-none focus:border-focus capitalize"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4 pt-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-primary">Synthesized Voice Feedback (TTS)</span>
                <input
                  type="checkbox"
                  checked={localPrefs.synthesize}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, synthesize: e.target.checked })}
                  className="rounded border-light text-accent-violet focus:ring-accent-violet"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-primary">Auto-save Snippets to Workspace</span>
                <input
                  type="checkbox"
                  checked={localPrefs.autoSave}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, autoSave: e.target.checked })}
                  className="rounded border-light text-accent-violet focus:ring-accent-violet"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-semibold text-xs brand-gradient shadow-sm hover:opacity-95 active:scale-95 transition-all"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
