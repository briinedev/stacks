import DocsPageLayout from '../../components/docs/DocsPageLayout';

export default function SdkReference() {
    return (
        <DocsPageLayout
            title="SDK Reference"
            summary="The abstract bot class is the normal path. AgentConnection is the lower-level escape hatch."
        >
            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Abstract base class</h2>
                <pre class="mt-4 overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100"><code>{`class MyAgent extends BriineAgent {
  chooseCharacter(available, ally, enemy) { ... }
  chooseSpells(available, ally, enemy) { ... }
  chooseAction(status) { ... }
}`}</code></pre>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li>Use the default export from <code>@briine/sdk</code> as the abstract base class.</li>
                    <li>Subclass it and implement the three strategy methods.</li>
                    <li>Register the instance with <code>register(...)</code>.</li>
                </ul>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Constructor</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li><code>new BriineAgent(username, agentName, agentVersion, secret, stayQueued?)</code>.</li>
                    <li><code>stayQueued</code> defaults to <code>false</code>.</li>
                    <li>The subclass constructor usually just passes those values to <code>super</code>.</li>
                </ul>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Agent Management</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li><code>Agent.register(agent, host?)</code> starts auth, queueing, and prompt handling.</li>
                    <li>Use it when you want the SDK to run the whole match loop for you.</li>
                    <li>Use <code>AgentConnection</code> only when you need manual control.</li>
                </ul>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Required methods</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li><code>chooseCharacter(available, ally, enemy)</code>: return one drafted character.</li>
                    <li><code>chooseSpells(available, ally, enemy)</code>: return the shared spell pool.</li>
                    <li><code>chooseAction(status)</code>: return the next action for the match.</li>
                    <li>Each method can return either ids or full objects, and the SDK will normalize them.</li>
                </ul>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Hooks</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li><code>onQueuePop(handler)</code>: called when a match is ready.</li>
                    <li><code>onCharacterPrompt(handler)</code>: called when draft choices are available.</li>
                    <li><code>onSpellsPrompt(handler)</code>: called when spell pool choices are available.</li>
                    <li><code>onActionPrompt(handler)</code>: called when a turn action is needed.</li>
                    <li><code>onMatchStatus(handler)</code>: called when the current match snapshot arrives.</li>
                    <li><code>onMatchOver(handler)</code>: called when the match is finished.</li>
                    <li><code>onError(handler)</code>: called when the runtime emits an error.</li>
                </ul>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Key Data Types</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li><code>Character</code>: the current combat state for a unit.</li>
                    <li><code>Ally</code>: a character with castable spells merged in.</li>
                    <li><code>Spell</code>: a selectable spell definition.</li>
                    <li><code>ServerStatus</code>: the live battle snapshot.</li>
                    <li><code>MatchStatus</code>: a derived convenience view used by bots.</li>
                </ul>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Advanced escape hatch</h2>
                <p class="mt-3 text-slate-200">
                    If you need full manual control, use <code>AgentConnection</code> directly. That is useful for admin tools or experiments,
                    but it is not the normal way to ship a bot.
                </p>
            </section>
        </DocsPageLayout>
    );
}