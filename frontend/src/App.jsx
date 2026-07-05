import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useUser } from './context/UserContext';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';

// Pages
import Dashboard from './pages/Dashboard';
import CodeEditor from './pages/CodeEditor';
import History from './pages/History';
import TemplateGallery from './pages/TemplateGallery';
import VoiceShortcuts from './pages/VoiceShortcuts';
import AccountSettings from './pages/AccountSettings';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children, isAuthenticated }) {
    return isAuthenticated ? children : <Navigate to="/" replace />;
}

function AppRoutes({ isLoaded, userId }) {
    const [showAuth, setShowAuth] = useState(false);
    const navigate = useNavigate();

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg-primary)] text-[color:var(--text-primary)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center animate-pulse text-white font-bold text-xl shadow-lg shadow-orange-500/20">
                        V
                    </div>
                    <div className="text-sm tracking-[0.3em] uppercase font-semibold text-[color:var(--text-secondary)]">
                        Loading VoxCode Studio...
                    </div>
                </div>
            </div>
        );
    }

    const handleEnterWorkspace = () => {
        // If in local dev mode or authenticated, jump straight to dashboard
        if (userId) {
            navigate('/dashboard');
        } else {
            setShowAuth(true);
        }
    };

    return (
        <Routes>
            {/* Landing & Auth Route - Accessible to everyone so they can view the landing page */}
            <Route
                path="/"
                element={
                    showAuth ? (
                        <AuthPage
                            onSuccess={() => navigate('/dashboard')}
                            onBack={() => setShowAuth(false)}
                            onLocalLaunch={() => navigate('/dashboard')}
                        />
                    ) : (
                        <LandingPage onGetStarted={handleEnterWorkspace} />
                    )
                }
            />

            {/* Protected Studio Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute isAuthenticated={!!userId}>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/editor"
                element={
                    <ProtectedRoute isAuthenticated={!!userId}>
                        <CodeEditor />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/history"
                element={
                    <ProtectedRoute isAuthenticated={!!userId}>
                        <History />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/templates"
                element={
                    <ProtectedRoute isAuthenticated={!!userId}>
                        <TemplateGallery />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/commands"
                element={
                    <ProtectedRoute isAuthenticated={!!userId}>
                        <VoiceShortcuts />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute isAuthenticated={!!userId}>
                        <AccountSettings />
                    </ProtectedRoute>
                }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default function App({ isLoaded = true, userId = null }) {
    return (
        <BrowserRouter>
            <AppRoutes isLoaded={isLoaded} userId={userId} />
        </BrowserRouter>
    );
}
