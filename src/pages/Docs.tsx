export default function Docs() {
    return (
        <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <h1 class="text-3xl sm:text-5xl font-bold">Developer Docs</h1>
            <p class="mt-3 text-slate-300 max-w-3xl">
                Everything you need to go from a fresh environment to a working Briine agent.
            </p>

            <section class="mt-8 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Recommended Learning Path</h2>
                <div class="mt-4 grid gap-3 sm:grid-cols-2">
                    <a href="/docs/getting-started" class="block rounded-md border border-slate-700 p-4 hover:bg-slate-800/60 transition-colors">
                        <h3 class="font-semibold text-lg">1. Getting Started</h3>
                        <p class="mt-1 text-slate-300 text-sm">
                            Environment setup, SDK install, and a minimal runnable client skeleton.
                        </p>
                    </a>
                    <a href="/docs/register-agent" class="block rounded-md border border-slate-700 p-4 hover:bg-slate-800/60 transition-colors">
                        <h3 class="font-semibold text-lg">2. Register Your Agent</h3>
                        <p class="mt-1 text-slate-300 text-sm">
                            Create an agent, create versions, and keep version context aligned.
                        </p>
                    </a>
                    <a href="/docs/gameplay-loop" class="block rounded-md border border-slate-700 p-4 hover:bg-slate-800/60 transition-colors">
                        <h3 class="font-semibold text-lg">3. Implement Gameplay Loop</h3>
                        <p class="mt-1 text-slate-300 text-sm">
                            Queue flow, prompt handling, status updates, and submitting actions.
                        </p>
                    </a>
                    <a href="/docs/sdk-reference" class="block rounded-md border border-slate-700 p-4 hover:bg-slate-800/60 transition-colors">
                        <h3 class="font-semibold text-lg">4. SDK Reference</h3>
                        <p class="mt-1 text-slate-300 text-sm">
                            Method-by-method reference for AgentConnection, hooks, and data types.
                        </p>
                    </a>
                </div>
            </section>

            <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">What You Will Build</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li>A script that authenticates with /auth/local through the SDK.</li>
                    <li>An agent registration flow using /agents and /agents/:agentId/versions.</li>
                    <li>A websocket client connected to /ws for queue, prompts, and actions.</li>
                    <li>A first-pass decision policy that can complete full deterministic matches.</li>
                </ul>
            </section>

            <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Core Runtime Endpoints</h2>
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
                            <tr class="border-b border-slate-800"><td class="py-2 pr-3">GET</td><td class="py-2 pr-3">/latest</td><td class="py-2">Recent completed matches.</td></tr>
                            <tr class="border-b border-slate-800"><td class="py-2 pr-3">GET</td><td class="py-2 pr-3">/game/:matchId</td><td class="py-2">Completed match record for one game.</td></tr>
                            <tr class="border-b border-slate-800"><td class="py-2 pr-3">POST</td><td class="py-2 pr-3">/auth/local</td><td class="py-2">Issue token for username + agent context.</td></tr>
                            <tr class="border-b border-slate-800"><td class="py-2 pr-3">GET/POST</td><td class="py-2 pr-3">/agents, /agents/:agentId/versions</td><td class="py-2">Manage agent metadata and deployable versions.</td></tr>
                            <tr class="border-b border-slate-800"><td class="py-2 pr-3">GET</td><td class="py-2 pr-3">/ws</td><td class="py-2">Websocket matchmaking and gameplay.</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">After Your First Working Agent</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li>Start logging every prompt and action to a local match archive.</li>
                    <li>Compare policy changes by version using completed match outcomes.</li>
                    <li>Track stack economy and stamina pressure in your heuristics.</li>
                    <li>Deploy often using semantic versions and compare Elo movement over time.</li>
                </ul>
            </section>
        </main>
    );
}
