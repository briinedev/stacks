export default function Rules() {
    return (
        <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <h1 class="text-3xl sm:text-5xl font-bold">Rules</h1>
            <p class="mt-3 text-slate-300 max-w-3xl">
                Briine is deterministic. This page reflects the current engine behavior in game execution,
                including action validation, turn sequencing, stack updates, and game completion checks.
            </p>

            <section class="mt-8 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Core Match Model</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li>Game state is split into two teams: <code>north</code> and <code>south</code>.</li>
                    <li>Each side has character roster, shared team spell pool, and access to the global elemental stack.</li>
                    <li>The active side is tracked by <code>activeTeam</code> and starts as <code>north</code>.</li>
                    <li>Game completion is authoritative: if all characters on one side reach <code>hp &lt;= 0</code>, the other side wins immediately.</li>
                </ul>
            </section>

            <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Turn Lifecycle (Engine Order)</h2>
                <ol class="mt-3 list-decimal pl-5 space-y-2 text-slate-200">
                    <li><strong>Turn switch request:</strong> <code>startTurn(team)</code> does nothing if team is already active or a winner exists.</li>
                    <li><strong>Completion gate:</strong> engine checks for win before processing turn setup.</li>
                    <li><strong>Outgoing side stamina:</strong> every character on the previous active side regains stamina first.</li>
                    <li><strong>Incoming side reset:</strong> every incoming character has <code>isDefended</code> reset to <code>false</code>.</li>
                    <li><strong>Cooldown tick:</strong> cooldown decrement runs for character spells and team spell-pool spells.</li>
                    <li><strong>Effect tick:</strong> <code>effect.onTurnStart(char)</code> runs, then inactive effects are removed.</li>
                    <li><strong>No-actor safeguard:</strong> if incoming side has no available actors, engine immediately advances again.</li>
                </ol>
            </section>

            <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Action Request Contract</h2>
                <p class="mt-3 text-slate-200">Actions use this runtime shape:</p>
                <pre class="mt-3 overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100"><code>{`type ActionRequest = {
id: string;
type: string;
source: string;
target?: string[];
};`}</code></pre>
                <p class="mt-3 text-slate-200">
                    Handled action types in current engine logic are <code>defend</code>, <code>attack</code>, and <code>spell</code>.
                </p>
            </section>

            <section class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <article class="p-5 rounded-lg border border-slate-800 bg-slate-900">
                    <h2 class="text-xl font-semibold">Universal Validation</h2>
                    <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                        <li>Request must include non-empty <code>id</code>, <code>source</code>, and <code>type</code>.</li>
                        <li><code>source</code> must map to a living character on the active team.</li>
                        <li>Source must have stamina and still be allowed to act.</li>
                        <li>If target list is provided, all target ids must resolve to valid characters.</li>
                        <li>Failed validation logs an invalid-action event and action returns <code>false</code>.</li>
                    </ul>
                </article>

                <article class="p-5 rounded-lg border border-slate-800 bg-slate-900">
                    <h2 class="text-xl font-semibold">Defend</h2>
                    <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                        <li>Sets source character to defended state.</li>
                        <li>Ends action with <code>skipStaminaRegen = true</code>.</li>
                        <li>This makes defend unique: enemy stamina regeneration is skipped for that action.</li>
                    </ul>
                </article>

                <article class="p-5 rounded-lg border border-slate-800 bg-slate-900">
                    <h2 class="text-xl font-semibold">Attack</h2>
                    <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                        <li><code>id</code> must match one of the source character attacks.</li>
                        <li>Attack executes against validated target list.</li>
                        <li>After execution, elemental stack is generated based on attack element.</li>
                        <li>Stack gain is +2 for <code>CONTROLLER</code> class, otherwise +1.</li>
                    </ul>
                </article>

                <article class="p-5 rounded-lg border border-slate-800 bg-slate-900">
                    <h2 class="text-xl font-semibold">Spell</h2>
                    <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                        <li>Spell list is merged from character spells + team spell pool.</li>
                        <li>Spell must match <code>id</code> and be off cooldown.</li>
                        <li>If stack cost exists, required element must be available in global stack.</li>
                        <li><code>CASTER</code> class gets a stack discount of 1 on spell cost calculation.</li>
                        <li>On cast, stack cost is spent, spell executes, then action ends.</li>
                    </ul>
                </article>
            </section>

            <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">End-Action Behavior</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li>Completion check runs after each action attempt.</li>
                    <li>Unless action skipped it, enemy side stamina regenerates after the action.</li>
                    <li>If any character on active side can still act, turn continues on same side.</li>
                    <li>If no one can act and game is not complete, turn swaps to the other side.</li>
                </ul>
            </section>

            <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Status Payload Details</h2>
                <p class="mt-3 text-slate-200">
                    Runtime status emits both teams and stack snapshot. Per character status includes:
                </p>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li>Identity and class: <code>id</code>, <code>name</code>, <code>class</code>, primary and secondary element.</li>
                    <li>Combat state: <code>hp</code>, <code>isDefended</code>, <code>canAct</code>, <code>stamina</code>.</li>
                    <li>Attacks: id, name, and element metadata.</li>
                    <li>Effects: name, description, active flag.</li>
                    <li>Spells: merged character + pool spells, cooldown fields, stack cost, and computed <code>available</code> flag.</li>
                </ul>
                <p class="mt-3 text-sm text-slate-300">
                    Spell availability requires cooldown ready and enough stack after class modifier:
                    casters evaluate against <code>stackCost - 1</code>, other classes against full cost.
                </p>
            </section>

            <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Deterministic Logging Notes</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li>Game start and turn changes are logged by compact tokens.</li>
                    <li>Action logs include decoded actor id and target ids for attack and spell events.</li>
                    <li>Invalid actions are logged with side prefix and engine error reason.</li>
                    <li>Winner events are logged immediately when a side is fully defeated.</li>
                </ul>
            </section>
        </main>
    );
}
