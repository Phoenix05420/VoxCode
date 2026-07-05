import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import App from './App';
import './index.css';
import './modern-enhancements.css'; /* Modern web platform progressive enhancements */

function AppWithProviders({ isLoaded, userId }) {
    return (
        <ThemeProvider>
            <UserProvider>
                <App isLoaded={isLoaded} userId={userId} />
            </UserProvider>
        </ThemeProvider>
    );
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* Self-contained Local Studio Workspace: zero third-party cloud authentication required */}
        <AppWithProviders isLoaded={true} userId={'voxcode-developer'} />
    </StrictMode>,
);
