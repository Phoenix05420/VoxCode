import { Layout } from '../components/Layout';
import { Breadcrumb } from '../components/Breadcrumb';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Settings as SettingsIcon, Shield, Cpu, Mic, Volume2, Save, 
  Sparkles, Moon, Sun, Check, RefreshCw, Server, Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../utils/cn';
import { LANGUAGES } from '../utils/constants';

export default function AccountSettings() {
  const { user } = useUser();
  const { isDark, toggleTheme } = useTheme();

  // Settings State loaded from localStorage
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('voxcode-preferences');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      autoSave: true,
      synthesize: true,
      defaultLanguage: 'python',
      speechEngine: 'vosk_whisper',
      apiServerUrl: 'http://localhost:3001',
      voiceSpeed: 1.0,
      notifications: true,
    };
  });

  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('voxcode-preferences', JSON.stringify(preferences));
      setIsSaving(false);
      showToast('Workspace settings & AI pipeline preferences saved!');
    }, 400);
  };

  const handleTogglePreference = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, val) => {
    setPreferences(prev => ({ ...prev, [key]: val }));
  };

  return (
    <Layout title="Studio Configuration">
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Account & Settings' }]} />

        {/* Header Banner */}
        <div className="editorial-card rounded-[2.5rem] p-8 md:p-10 border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="grain-overlay absolute inset-0 -z-10 opacity-50" />
          <div className="flex items-center gap-4">
            <div className="brand-gradient flex h-14 w-14 items-center justify-center rounded-3xl text-white shadow-lg shadow-orange-500/20 shrink-0">
              <SettingsIcon size={28} />
            </div>
            <div>
              <h2 className="display-title text-3xl font-extrabold text-[color:var(--text-primary)]">Studio Preferences</h2>
              <p className="text-sm text-[color:var(--text-secondary)] mt-1">Configure your offline speech pipelines, local LLM server endpoints, and editor defaults.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="brand-gradient text-white px-8 py-3.5 rounded-2xl text-xs font-bold shadow-lg shadow-orange-500/20 hover:opacity-95 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

        {/* AI & Speech Pipeline Settings Section */}
        <div className="editorial-card rounded-[2.5rem] p-8 border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] shadow-lg space-y-6">
          <div className="flex items-center gap-3 border-b border-[color:var(--border-color)] pb-4">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-[color:var(--accent-primary)] font-bold">
              <Cpu size={20} />
            </div>
            <div>
              <h3 className="display-title font-bold text-xl text-[color:var(--text-primary)]">AI Engine & Speech Pipeline</h3>
              <p className="text-xs text-[color:var(--text-secondary)]">Manage connection parameters for your Python backend (Vosk ASR, Whisper, Qwen / Llama-3).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)] mb-2 flex items-center gap-1.5">
                <Server size={14} className="text-[color:var(--accent-primary)]" />
                <span>Backend API Server URL</span>
              </label>
              <input
                type="text"
                value={preferences.apiServerUrl}
                onChange={(e) => handleChange('apiServerUrl', e.target.value)}
                placeholder="http://localhost:3001"
                className="w-full px-4 py-3 rounded-2xl bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] text-sm font-medium text-[color:var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 transition-all"
              />
              <p className="text-[11px] text-[color:var(--text-secondary)] mt-1.5">Default port for offline Flask voice processing server is 3001.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)] mb-2 flex items-center gap-1.5">
                <Mic size={14} className="text-[color:var(--accent-primary)]" />
                <span>Speech Recognition Engine</span>
              </label>
              <select
                value={preferences.speechEngine}
                onChange={(e) => handleChange('speechEngine', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] text-sm font-bold text-[color:var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 transition-all cursor-pointer"
              >
                <option value="vosk_whisper">Vosk Real-Time ASR + OpenAI Whisper (Recommended)</option>
                <option value="vosk_only">Vosk Offline Lightweight ASR Only</option>
                <option value="browser_api">Browser WebSpeech API (Cloud Fallback)</option>
              </select>
              <p className="text-[11px] text-[color:var(--text-secondary)] mt-1.5">Vosk + Whisper provides zero-latency transcript hints with high-precision post-processing.</p>
            </div>
          </div>
        </div>

        {/* Voice Feedback & Editor Defaults */}
        <div className="editorial-card rounded-[2.5rem] p-8 border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] shadow-lg space-y-6">
          <div className="flex items-center gap-3 border-b border-[color:var(--border-color)] pb-4">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 font-bold">
              <Volume2 size={20} />
            </div>
            <div>
              <h3 className="display-title font-bold text-xl text-[color:var(--text-primary)]">Voice Feedback & Workspace Defaults</h3>
              <p className="text-xs text-[color:var(--text-secondary)]">Customize synthesized spoken responses and target programming language.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--text-secondary)] mb-2">
                Default Target Language
              </label>
              <select
                value={preferences.defaultLanguage}
                onChange={(e) => handleChange('defaultLanguage', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[color:var(--bg-tertiary)] border border-[color:var(--border-color)] text-sm font-bold text-[color:var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-primary)]/50 transition-all cursor-pointer capitalize"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[color:var(--bg-tertiary)]/50 border border-[color:var(--border-color)]">
              <div>
                <h4 className="font-bold text-sm text-[color:var(--text-primary)]">Synthesized Spoken Explanations</h4>
                <p className="text-xs text-[color:var(--text-secondary)] mt-0.5">Read aloud AI code breakdowns and completion confirmations.</p>
              </div>
              <button
                onClick={() => handleTogglePreference('synthesize')}
                className={cn(
                  "w-14 h-8 rounded-full transition-colors relative p-1 focus:outline-none shrink-0",
                  preferences.synthesize ? "brand-gradient" : "bg-slate-700"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full bg-white shadow-md transform transition-transform",
                  preferences.synthesize ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[color:var(--bg-tertiary)]/50 border border-[color:var(--border-color)]">
              <div>
                <h4 className="font-bold text-sm text-[color:var(--text-primary)]">Auto-Save Snippets to History</h4>
                <p className="text-xs text-[color:var(--text-secondary)] mt-0.5">Automatically record generated drafts to your local library.</p>
              </div>
              <button
                onClick={() => handleTogglePreference('autoSave')}
                className={cn(
                  "w-14 h-8 rounded-full transition-colors relative p-1 focus:outline-none shrink-0",
                  preferences.autoSave ? "brand-gradient" : "bg-slate-700"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full bg-white shadow-md transform transition-transform",
                  preferences.autoSave ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[color:var(--bg-tertiary)]/50 border border-[color:var(--border-color)]">
              <div>
                <h4 className="font-bold text-sm text-[color:var(--text-primary)]">Interface Theme Mode</h4>
                <p className="text-xs text-[color:var(--text-secondary)] mt-0.5">Switch between dark glassmorphism and light editorial mode.</p>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-xl bg-[color:var(--bg-secondary)] border border-[color:var(--border-color)] text-xs font-bold text-[color:var(--text-primary)] hover:bg-[color:var(--bg-tertiary)] transition-all flex items-center gap-2"
              >
                {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-400" />}
                <span>{isDark ? 'Switch to Light' : 'Switch to Dark'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Account Details Section */}
        <div className="editorial-card rounded-[2.5rem] p-8 border border-[color:var(--border-color)] bg-[color:var(--bg-secondary)] shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[color:var(--bg-tertiary)] flex items-center justify-center text-[color:var(--accent-primary)] font-bold text-lg shadow-inner">
              {user?.email?.charAt(0)?.toUpperCase() || 'V'}
            </div>
            <div>
              <h4 className="font-bold text-base text-[color:var(--text-primary)]">
                {user?.email || 'Local Developer Session'}
              </h4>
              <p className="text-xs text-[color:var(--text-secondary)] flex items-center gap-1 mt-0.5">
                <Shield size={13} className="text-emerald-500" />
                <span>Protected Studio Access • Offline Workspace Active</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Pro License
          </span>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div className="brand-gradient px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-white font-bold text-sm">
              <Sparkles size={16} />
              <span>{toast}</span>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
