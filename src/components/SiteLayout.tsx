import { IconBrandDiscord, IconBrandGithub } from '@tabler/icons-preact';
import { ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';

import UserProvider, { UserContext } from './contexts/UserContext';
import ChampionBanner from './ChampionBanner';
import { editorialBrand } from '../content/chronicles';

type SiteLayoutProps = {
    children: ComponentChildren;
};

export function UserButton() {
    const user = useContext(UserContext);

    if (!user) {
        return (
            <a href={`${import.meta.env.VITE_API_HOST}/auth/github`} class="px-3 py-2 rounded hover:bg-slate-800">Login</a>
        );
    }

    return (
        <a href="/account" class="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-800">
            <img src={user.avatar} alt={user.username} class="w-6 h-6 rounded-full" />
            <span>{user.username}</span>
        </a>
    );
}

export default function SiteLayout({ children }: SiteLayoutProps) {
    return (
        <UserProvider>
            <div class="min-h-screen bg-slate-950 text-slate-100">
                <header class="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-10 backdrop-blur">
                    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-3 items-center justify-between">
                        <a href="/" class="inline-flex items-center gap-2 font-bold tracking-wide text-lg">
                            <img src="/favicon.svg" alt="Briine logo" class="w-6 h-6 sm:w-7 sm:h-7" />
                            <span>Briine</span>
                        </a>
                        <nav class="flex flex-wrap gap-2 sm:gap-3 text-sm sm:text-base">
                            <a href="/docs" class="px-3 py-2 rounded hover:bg-slate-800">Docs</a>
                            <a href="/leaderboard" class="px-3 py-2 rounded hover:bg-slate-800">The Hill</a>
                            <a href="/data" class="px-3 py-2 rounded hover:bg-slate-800">Data</a>
                            <a href="/rules" class="px-3 py-2 rounded hover:bg-slate-800">Rules</a>
                            <a href="/chronicles" class="px-3 py-2 rounded hover:bg-slate-800">{editorialBrand.shortLabel}</a>
                            <UserButton />
                        </nav>
                    </div>
                </header>

                <ChampionBanner />

                {children}

                <footer class="border-t border-slate-800 mt-16">
                    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-300">
                        <div class="flex flex-wrap items-center justify-between gap-4">
                            <div>Built as a public challenge arena for code.</div>
                            <div class="flex items-center gap-4">
                                <a href="https://github.com/briinedev" target="_blank" class="inline-flex items-center gap-1 hover:text-blue-400"><IconBrandGithub /> GitHub</a>
                                <a href="https://discord.gg/24EcfGggDu" target="_blank" class="inline-flex items-center gap-1 hover:text-blue-400"><IconBrandDiscord /> Discord</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </UserProvider>
    );
}
