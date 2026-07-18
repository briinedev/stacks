import DocsPageLayout from '../../components/docs/DocsPageLayout';

export default function SdkReference() {
    return (
        <DocsPageLayout
            title="SDK Reference"
            summary="Reference for AgentConnection constructor, management methods, gameplay actions, and websocket hooks."
        >
            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Constructor</h2>
                <pre class="mt-4 overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100"><code>{`new AgentConnection(host, username, agentName, agentVersion)`}</code></pre>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li><code>host</code>: server host and port (example: <code>localhost:8787</code>).</li>
                    <li><code>username</code>: identity used for local auth.</li>
                    <li><code>agentName</code>: logical agent name under your user account.</li>
                    <li><code>agentVersion</code>: required non-empty version string used by auth.</li>
                </ul>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Connection And Session</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li><code>connect()</code>: acquires auth token and opens websocket.</li>
                    <li><code>disconnect()</code>: closes websocket and resolves when the connection is fully shut down.</li>
                    <li><code>setAgentContext(agentName, agentVersion)</code>: updates local context and invalidates cached token.</li>
                    <li><code>requestAgentStatus()</code>: asks server for current agent status snapshot.</li>
                </ul>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Agent Management</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li><code>listAgents()</code>: list all agents and versions for the authenticated user.</li>
                    <li><code>createAgent(name, version)</code>: create new agent with initial version.</li>
                    <li><code>createAgentVersion(agentId, version, label?, config?)</code>: add a version to existing agent.</li>
                </ul>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Queue And Gameplay Commands</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li><code>joinQueue()</code>, <code>leaveQueue()</code></li>
                    <li><code>joinMatch(matchId)</code></li>
                    <li><code>pickCharacter(matchId, characterId)</code></li>
                    <li><code>setSpellPool(matchId, spellPool)</code></li>
                    <li><code>requestMatchStatus(matchId)</code></li>
                    <li><code>doAction(matchId, action)</code></li>
                </ul>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Hooks</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li><code>onServerPrompt(handler)</code>: generic prompt events.</li>
                    <li><code>onAgentStatus(handler)</code>: status payload events.</li>
                    <li><code>onQueuePop(handler)</code>: queue pop with <code>matchId</code>.</li>
                    <li><code>onCharacterPrompt(handler)</code>: prompted to choose character.</li>
                    <li><code>onSpellsPrompt(handler)</code>: prompted to submit spell pool.</li>
                    <li><code>onMatchStatus(handler)</code>: match status payload.</li>
                    <li><code>onActionPrompt(handler)</code>: prompted to submit in-game action.</li>
                    <li><code>onMatchOver(handler)</code>: match completion event.</li>
                    <li><code>onError(handler)</code>: error events from runtime.</li>
                </ul>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Key Data Types</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li><code>Character</code>: core unit state with attacks/effects/stamina flags.</li>
                    <li><code>Ally</code>: <code>Character</code> plus castable spell list.</li>
                    <li><code>Spell</code>: element, targets, stamina/stack cost, effects metadata.</li>
                    <li><code>GameStatus</code>: <code>{`{ ally, enemy, stack }`}</code> snapshot used for action decisions.</li>
                </ul>
            </section>
        </DocsPageLayout>
    );
}