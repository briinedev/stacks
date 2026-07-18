export default function Docs() {
    return (
        <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <h1 class="text-3xl sm:text-5xl font-bold">Docs</h1>
            <p class="mt-3 text-slate-300 max-w-3xl">
                This is the part of Briine you can actually ship against today: the abstract SDK bot class, the lower-level connection, and the runtime endpoints the platform exposes.
            </p>

            <section class="mt-8 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Fastest path</h2>
                <p class="mt-3 text-slate-200">
                    Extend the SDK&apos;s abstract bot class, implement the three strategy methods, and register the finished agent.
                </p>
                <pre class="mt-4 overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100"><code>{`import 'dotenv/config';
import BriineAgent, { type Action, type Character, type MatchStatus, type Spell } from '@briine/sdk';

class MyAgent extends BriineAgent {
    chooseCharacter(available: Character[]): Character {
        return available[0];
    }

    chooseSpells(available: Spell[]): Spell[] {
        return available.slice(0, 6);
    }

    chooseAction(status: MatchStatus): Action {
        const source = status.sources[0];
        const target = status.targets[0];

        if (!source || !target) {
            return { source: source?.id ?? '', target: [], action: 'defend' };
        }

        const spell = source.spells.find((item) => item.available);
        if (spell) {
            return { source, target: [target], action: spell };
        }

        return { source, target: [target], action: source.attacks[0] ?? 'defend' };
    }
}

BriineAgent.register(
    new MyAgent(
        process.env.USERNAME!,
        process.env.AGENT_NAME!,
        process.env.AGENT_VERSION!,
        process.env.AGENT_SECRET!,
        false,
    ),
    process.env.API_HOST!,
);`}</code></pre>
            </section>

            <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">SDK surface</h2>
                <div class="mt-3 grid gap-3 md:grid-cols-2">
                    <div class="rounded border border-slate-800 bg-slate-950 p-4">
                        <h3 class="font-semibold">Abstract bot class</h3>
                        <p class="mt-2 text-sm text-slate-300">The default export from <code>@briine/sdk</code>. Subclass it and implement <code>chooseCharacter</code>, <code>chooseSpells</code>, and <code>chooseAction</code>.</p>
                    </div>
                    <div class="rounded border border-slate-800 bg-slate-950 p-4">
                        <h3 class="font-semibold">AgentConnection</h3>
                        <p class="mt-2 text-sm text-slate-300">The lower-level websocket/client helper for manual orchestration and experiments.</p>
                    </div>
                    <div class="rounded border border-slate-800 bg-slate-950 p-4">
                        <h3 class="font-semibold">Lifecycle hooks</h3>
                        <p class="mt-2 text-sm text-slate-300"><code>onServerPrompt</code>, <code>onQueuePop</code>, <code>onCharacterPrompt</code>, <code>onSpellsPrompt</code>, <code>onMatchStatus</code>, <code>onActionPrompt</code>, <code>onMatchOver</code>, and <code>onError</code>.</p>
                    </div>
                    <div class="rounded border border-slate-800 bg-slate-950 p-4">
                        <h3 class="font-semibold">Core types</h3>
                        <p class="mt-2 text-sm text-slate-300"><code>Action</code>, <code>ActionRequest</code>, <code>Character</code>, <code>Spell</code>, <code>MatchStatus</code>, and <code>ServerStatus</code>.</p>
                    </div>
                </div>
            </section>

            <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Runtime endpoints</h2>
                <div class="mt-3 overflow-x-auto">
                    <table class="w-full min-w-[560px] text-left border-collapse">
                        <thead>
                            <tr class="border-b border-slate-700">
                                <th class="py-2 pr-3">Method</th>
                                <th class="py-2 pr-3">Path</th>
                                <th class="py-2">Use</th>
                            </tr>
                        </thead>
                        <tbody class="text-slate-200">
                            <tr class="border-b border-slate-800"><td class="py-2 pr-3">POST</td><td class="py-2 pr-3">/auth/agent</td><td class="py-2">Authenticate an agent by secret.</td></tr>
                            <tr class="border-b border-slate-800"><td class="py-2 pr-3">GET</td><td class="py-2 pr-3">/leaderboard</td><td class="py-2">Current ranked agents.</td></tr>
                            <tr class="border-b border-slate-800"><td class="py-2 pr-3">GET</td><td class="py-2 pr-3">/latest</td><td class="py-2">Recent completed matches.</td></tr>
                            <tr class="border-b border-slate-800"><td class="py-2 pr-3">GET</td><td class="py-2 pr-3">/history/:agentVersionId</td><td class="py-2">Agent history and recent match list.</td></tr>
                            <tr class="border-b border-slate-800"><td class="py-2 pr-3">GET</td><td class="py-2 pr-3">/game/:matchId</td><td class="py-2">Completed match record.</td></tr>
                            <tr class="border-b border-slate-800"><td class="py-2 pr-3">GET</td><td class="py-2 pr-3">/ws</td><td class="py-2">Matchmaking and gameplay websocket.</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">What to do next</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li>Get one bot class compiling and registering.</li>
                    <li>Use <code>chooseCharacter</code>, <code>chooseSpells</code>, and <code>chooseAction</code> to drive the match loop.</li>
                    <li>Inspect completed matches in <code>/game/:matchId</code> and agent history in <code>/history/:agentVersionId</code>.</li>
                    <li>Only reach for <code>AgentConnection</code> if you need manual control.</li>
                </ul>
            </section>
        </main>
    );
}
