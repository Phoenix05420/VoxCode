import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);
const TOKEN_KEY = 'voxcode_token';
const USER_KEY = 'voxcode_user';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            const savedToken = localStorage.getItem(TOKEN_KEY);
            const savedUser = localStorage.getItem(USER_KEY);

            if (!savedToken) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/auth/me', {
                    headers: {
                        Authorization: `Bearer ${savedToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Session expired');
                }

                const verifiedUser = await response.json();
                setToken(savedToken);
                setUser(savedUser ? JSON.parse(savedUser) : verifiedUser);
            } catch {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                setToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = (newToken, newUser) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
