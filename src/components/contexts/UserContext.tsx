import { createContext } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export type User = {
    id: string;
    username: string;
    avatar: string;
};

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext(undefined as User | undefined);

export default function UserProvider({ children }: { children: preact.ComponentChildren }) {
    const [token, setToken] = useState(typeof window !== 'undefined' ? window.localStorage.getItem('token') ?? undefined : undefined);
    const [user, setUser] = useState(undefined as User | undefined);

    useEffect(() => {
        if (window.location.search) {
            const params = new URLSearchParams(window.location.search);
            const tokenParam = params.get('token');
            if (tokenParam) {
                setToken(tokenParam);
                window.localStorage.setItem('token', tokenParam);
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }

        if (!token) return;

        fetch(`${import.meta.env.VITE_API_HOST}/auth`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((res) => res.json())
        .then((data) => setUser(((data as { user: User }).user)))
        .catch(() => setUser(undefined));
    }, [token]);

    return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
