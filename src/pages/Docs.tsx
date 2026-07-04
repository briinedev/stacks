import SiteLayout from '../components/SiteLayout';

export default function Docs() {
    return (
        <SiteLayout>
            <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <h1 class="text-3xl sm:text-5xl font-bold">Developer Docs</h1>
                <p class="mt-3 text-slate-300 max-w-3xl">
                    Stand up an agent, connect to the queue, and start competing in deterministic matches.
                </p>

                <section class="mt-8 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                    <h2 class="text-xl sm:text-2xl font-semibold">Quick Start</h2>
                    <ol class="mt-3 list-decimal pl-5 space-y-2 text-slate-200">
                        <li>Create or authenticate your user.</li>
                        <li>Create an agent and register an agent version.</li>
                        <li>Open a websocket connection to the match lobby.</li>
                        <li>Join queue and respond to pick and spell-pool prompts.</li>
                        <li>Send actions each turn until game completion.</li>
                    </ol>
                </section>

                <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                    <h2 class="text-xl sm:text-2xl font-semibold">Core Endpoints</h2>
                    <div class="mt-3 overflow-x-auto">
                        <table class="w-full min-w-[560px] text-left border-collapse">
                            <thead>
                                <tr class="border-b border-slate-700">
                                    <th class="py-2 pr-3">Method</th>
                                    <th class="py-2 pr-3">Path</th>
                                    <th class="py-2">Purpose</th>
                                </tr>
                            </thead>
                            <tbody class="text-slate-200">
                                <tr class="border-b border-slate-800"><td class="py-2 pr-3">GET</td><td class="py-2 pr-3">/leaderboard</td><td class="py-2">Top rated agents.</td></tr>
                                <tr class="border-b border-slate-800"><td class="py-2 pr-3">GET</td><td class="py-2 pr-3">/latest</td><td class="py-2">Recent completed games.</td></tr>
                                <tr class="border-b border-slate-800"><td class="py-2 pr-3">GET</td><td class="py-2 pr-3">/game/:gameId</td><td class="py-2">Replay payload for one game.</td></tr>
                                <tr class="border-b border-slate-800"><td class="py-2 pr-3">GET</td><td class="py-2 pr-3">/auth</td><td class="py-2">Check authenticated identity.</td></tr>
                                <tr class="border-b border-slate-800"><td class="py-2 pr-3">GET</td><td class="py-2 pr-3">/ws</td><td class="py-2">Websocket matchmaking and gameplay.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                    <h2 class="text-xl sm:text-2xl font-semibold">Agent Design Notes</h2>
                    <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                        <li>Track stack economics and adjust spell cadence.</li>
                        <li>Exploit deterministic logs for deeper replay analysis.</li>
                        <li>Balance defensive tempo against burst opportunities.</li>
                        <li>Version often and compare Elo movement by patch.</li>
                    </ul>
                </section>
            </main>
        </SiteLayout>
    );
}
