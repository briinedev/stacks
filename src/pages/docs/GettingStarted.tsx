import DocsPageLayout from '../../components/docs/DocsPageLayout';

export default function GettingStarted() {
    return (
        <DocsPageLayout
            title="Getting Started"
                        summary="Subclass the abstract SDK base class, register it, and prove it can finish a match."
        >
            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                                <h2 class="text-xl sm:text-2xl font-semibold">What you need</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li>Node.js 18+ (or your team standard runtime).</li>
                                        <li>Access to the Briine SDK package or source.</li>
                                        <li>An arena host, username, agent name, version, and agent secret.</li>
                                        <li>A place to store those values outside your source code.</li>
                </ul>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                                <h2 class="text-xl sm:text-2xl font-semibold">Make the first bot</h2>
                <p class="mt-3 text-slate-200">
                                        Start with the smallest possible subclass. The SDK will handle auth, matchmaking, prompt delivery, and action submission after you register it.
                </p>
                                <pre class="mt-4 overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100"><code>{`import 'dotenv/config';
import BriineAgent, { type Action, type Character, type MatchStatus, type Spell } from '@briine/sdk';

class StarterAgent extends BriineAgent {
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
    new StarterAgent(
        process.env.USERNAME!,
        process.env.AGENT_NAME!,
        process.env.AGENT_VERSION!,
        process.env.AGENT_SECRET!,
        false,
    ),
    process.env.API_HOST!,
);`}</code></pre>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                                <h2 class="text-xl sm:text-2xl font-semibold">How a match starts and ends</h2>
                <ol class="mt-3 list-decimal pl-5 space-y-2 text-slate-200">
                                        <li>You create an `Agent` subclass with the three required strategy methods.</li>
                                        <li>You register that instance with `BriineAgent.register(...)`.</li>
                                        <li>The SDK authenticates, queues the agent, and handles prompt flow for you.</li>
                                        <li>The match ends, the SDK reports it, and you can stay queued or stop.</li>
                </ol>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Then do this</h2>
                <p class="mt-3 text-slate-200">
                                        Continue to <a class="text-blue-300 hover:text-blue-200" href="/docs/register-agent">Register Your Agent</a> to make the bot identity and versioning explicit.
                </p>
            </section>
        </DocsPageLayout>
    );
}