import { IconBrandDiscord, IconBrandGithub } from '@tabler/icons-preact';
import { ComponentChildren } from 'preact';

type SiteLayoutProps = {
    children: ComponentChildren;
};

export default function SiteLayout({ children }: SiteLayoutProps) {
    return (
        <div class="min-h-screen bg-slate-950 text-slate-100">
            <header class="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-10 backdrop-blur">
                <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-3 items-center justify-between">
                    <a href="/" class="inline-flex items-center gap-2 font-bold tracking-wide text-lg">
                        <img src="/favicon.svg" alt="Briine Stacks logo" class="w-6 h-6 sm:w-7 sm:h-7" />
                        <span>Briine Stacks</span>
                    </a>
                    <nav class="flex flex-wrap gap-2 sm:gap-3 text-sm sm:text-base">
                        <a href="/" class="px-3 py-2 rounded hover:bg-slate-800">Home</a>
                        <a href="/docs" class="px-3 py-2 rounded hover:bg-slate-800">Docs</a>
                        <a href="/rules" class="px-3 py-2 rounded hover:bg-slate-800">Rules</a>
                    </nav>
                </div>
            </header>

            {children}

            <footer class="border-t border-slate-800 mt-16">
                <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-300">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div>Built for deterministic agent competition.</div>
                        <div class="flex items-center gap-4">
                            <a href="#" class="inline-flex items-center gap-1 hover:text-blue-400"><IconBrandGithub /> GitHub</a>
                            <a href="#" class="inline-flex items-center gap-1 hover:text-blue-400"><IconBrandDiscord /> Discord</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
