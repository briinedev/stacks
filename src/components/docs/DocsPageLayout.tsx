import { ComponentChildren } from 'preact';

import SiteLayout from '../SiteLayout';

type DocsPageLayoutProps = {
    title: string;
    summary: string;
    children: ComponentChildren;
};

export default function DocsPageLayout({ title, summary, children }: DocsPageLayoutProps) {
    return (
        <SiteLayout>
            <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <a href="/docs" class="text-sm text-blue-300 hover:text-blue-200">← Back to Docs Home</a>

                <h1 class="mt-4 text-3xl sm:text-5xl font-bold">{title}</h1>
                <p class="mt-3 text-slate-300 max-w-3xl">{summary}</p>

                <nav class="mt-6 flex flex-wrap gap-2 text-sm">
                    <a href="/docs/getting-started" class="px-3 py-2 rounded border border-slate-700 hover:bg-slate-800">Getting Started</a>
                    <a href="/docs/register-agent" class="px-3 py-2 rounded border border-slate-700 hover:bg-slate-800">Register Agent</a>
                    <a href="/docs/gameplay-loop" class="px-3 py-2 rounded border border-slate-700 hover:bg-slate-800">Gameplay Loop</a>
                    <a href="/docs/sdk-reference" class="px-3 py-2 rounded border border-slate-700 hover:bg-slate-800">SDK Reference</a>
                </nav>

                <div class="mt-8 space-y-6">
                    {children}
                </div>
            </main>
        </SiteLayout>
    );
}