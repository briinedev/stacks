import { IconArrowRight, IconBrandGithub, IconExternalLink } from '@tabler/icons-preact';
import { useContext } from 'preact/hooks';

import { UserContext } from '../components/contexts/UserContext';

export default function Docs() {
    const user = useContext(UserContext);
    const accountHref = user ? '/account' : `${import.meta.env.VITE_API_HOST}/auth/github`;
    const accountLabel = user ? 'Open your account' : 'Log in with GitHub';

    return (
        <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <section class="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
                <div class="max-w-3xl">
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Get Started</p>
                    <h1 class="mt-3 text-4xl sm:text-5xl font-bold leading-tight">Go from zero to a live Briine bot fast.</h1>
                    <p class="mt-4 text-lg text-slate-300">
                        Briine is a coding competition where your agent connects to the arena, joins matchmaking, drafts a team,
                        picks a spell pool, and chooses actions until the match ends.
                    </p>

                    <div class="mt-6 flex flex-wrap gap-3">
                        <a href="#create" class="inline-flex items-center gap-2 rounded bg-blue-300 px-4 py-3 font-semibold text-slate-950 hover:bg-blue-200">
                            Start with the initializer <IconArrowRight size={18} />
                        </a>
                        <a href="https://www.npmjs.com/package/@briine/sdk" target="_blank" class="inline-flex items-center gap-2 rounded border border-slate-700 px-4 py-3 font-semibold text-slate-100 hover:bg-slate-800">
                            SDK reference <IconExternalLink size={18} />
                        </a>
                    </div>
                </div>
            </section>

            <section class="mt-8 grid gap-4 md:grid-cols-4">
                <article class="rounded-xl border border-slate-800 bg-slate-900 p-5 md:col-span-1">
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">1</p>
                    <h2 class="mt-2 text-xl font-semibold">Connect</h2>
                    <p class="mt-2 text-slate-300">Your bot authenticates with Briine and connects to the arena server.</p>
                </article>
                <article class="rounded-xl border border-slate-800 bg-slate-900 p-5 md:col-span-1">
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">2</p>
                    <h2 class="mt-2 text-xl font-semibold">Queue</h2>
                    <p class="mt-2 text-slate-300">Once connected, it joins matchmaking and waits to be paired with another agent.</p>
                </article>
                <article class="rounded-xl border border-slate-800 bg-slate-900 p-5 md:col-span-1">
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">3</p>
                    <h2 class="mt-2 text-xl font-semibold">Draft</h2>
                    <p class="mt-2 text-slate-300">Your code chooses characters and a spell pool before combat starts.</p>
                </article>
                <article class="rounded-xl border border-slate-800 bg-slate-900 p-5 md:col-span-1">
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">4</p>
                    <h2 class="mt-2 text-xl font-semibold">Act</h2>
                    <p class="mt-2 text-slate-300">During combat, your bot responds to prompts and decides each action.</p>
                </article>
            </section>

            <section id="create" class="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
                <div class="max-w-3xl">
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Create Your Bot</p>
                    <h2 class="mt-3 text-3xl sm:text-4xl font-bold">Start from the official initializer.</h2>
                    <p class="mt-4 text-slate-300">
                        The fastest path is to scaffold a bot project, fill in your Briine credentials, and start iterating on strategy.
                    </p>
                </div>

                <div class="mt-5 overflow-x-auto rounded-xl border border-slate-700 bg-slate-950 p-4">
                    <code class="text-sm sm:text-base text-slate-100">npm create @briine/bot@latest my-bot</code>
                </div>

                <div class="mt-5 grid gap-4 md:grid-cols-3">
                    <article class="rounded-xl border border-slate-800 bg-slate-950 p-5">
                        <h3 class="text-lg font-semibold">Scaffold</h3>
                        <p class="mt-2 text-slate-300">Generate a minimal TypeScript bot that already uses the Briine SDK.</p>
                    </article>
                    <article class="rounded-xl border border-slate-800 bg-slate-950 p-5">
                        <h3 class="text-lg font-semibold">Configure</h3>
                        <p class="mt-2 text-slate-300">Copy `.env.example` to `.env` and paste in the values from your Briine account.</p>
                    </article>
                    <article class="rounded-xl border border-slate-800 bg-slate-950 p-5">
                        <h3 class="text-lg font-semibold">Run</h3>
                        <p class="mt-2 text-slate-300">Start the bot locally and let it connect, queue, and begin playing matches.</p>
                    </article>
                </div>
            </section>

            <section class="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
                <div class="max-w-3xl">
                    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Register Your Agent</p>
                    <h2 class="mt-3 text-3xl sm:text-4xl font-bold">Create the values your bot needs.</h2>
                    <p class="mt-4 text-slate-300">
                        After scaffolding, log in and create your first agent. Briine will give you the name, version, and secret that the starter project expects.
                    </p>
                </div>

                <div class="mt-5 grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
                    <div class="rounded-xl border border-slate-800 bg-slate-950 p-5">
                        <ol class="list-decimal pl-5 space-y-3 text-slate-200">
                            <li>Log in to Briine with GitHub.</li>
                            <li>Create your first agent from your account page.</li>
                            <li>Copy the generated values into the `.env` file created by the initializer.</li>
                            <li>Run your bot locally and let it join the queue.</li>
                        </ol>
                    </div>

                    <div class="rounded-xl border border-slate-800 bg-slate-950 p-5">
                        <h3 class="text-lg font-semibold">Next action</h3>
                        <p class="mt-2 text-slate-300">Use your account page to create the bot credentials referenced by the starter template.</p>
                        <div class="mt-4 flex flex-col gap-3">
                            <a href={accountHref} class="inline-flex items-center justify-center gap-2 rounded bg-blue-300 px-4 py-3 font-semibold text-slate-950 hover:bg-blue-200">
                                {accountLabel} <IconArrowRight size={18} />
                            </a>
                            <a href="https://github.com/briinedev" target="_blank" class="inline-flex items-center justify-center gap-2 rounded border border-slate-700 px-4 py-3 font-semibold text-slate-100 hover:bg-slate-800">
                                View Briine on GitHub <IconBrandGithub size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section class="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
                <h2 class="text-2xl sm:text-3xl font-bold">Keep the reference material separate.</h2>
                <p class="mt-4 max-w-3xl text-slate-300">
                    This page is the fast path. When you need exact TypeScript shapes or SDK details, use the SDK package docs and your editor.
                    The goal here is to get you from first visit to first running bot with as little friction as possible.
                </p>
                <div class="mt-5 flex flex-wrap gap-3">
                    <a href="https://www.npmjs.com/package/@briine/sdk" target="_blank" class="inline-flex items-center gap-2 rounded border border-slate-700 px-4 py-3 font-semibold text-slate-100 hover:bg-slate-800">
                        Open SDK package <IconExternalLink size={18} />
                    </a>
                    <a href="/rules" class="inline-flex items-center gap-2 rounded border border-slate-700 px-4 py-3 font-semibold text-slate-100 hover:bg-slate-800">
                        Read the game rules <IconArrowRight size={18} />
                    </a>
                </div>
            </section>
        </main>
    );
}