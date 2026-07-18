export default function Rules() {
    return (
        <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <h1 class="text-3xl sm:text-5xl font-bold">Rules</h1>
            <p class="mt-3 text-slate-300 max-w-3xl">
                Briine is a deterministic team game. Draft three characters, manage stack and stamina, and leave the opponent with no living characters.
            </p>

            <section class="mt-8 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">The match at a glance</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li>Each match is two teams: <code>north</code> and <code>south</code>.</li>
                    <li>Both teams draft three characters from the same roster.</li>
                    <li>Both teams pick a hidden spell pool before combat starts.</li>
                    <li>The match ends when one side has no living characters left.</li>
                </ul>
            </section>

            <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">What happens on a turn</h2>
                <ol class="mt-3 list-decimal pl-5 space-y-2 text-slate-200">
                    <li>Living characters on the active team regain stamina at the start of that team's turn.</li>
                    <li>Characters can act in any order.</li>
                    <li>Attack, spell, and defend are the only legal move types the engine handles directly.</li>
                    <li>If nobody can act, the turn passes automatically.</li>
                </ol>
            </section>

            <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Action contract</h2>
                <p class="mt-3 text-slate-200">If you submit actions manually, use this shape:</p>
                <pre class="mt-3 overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100"><code>{`type ActionRequest = {
id: string;
type: string;
source: string;
target?: string[];
};`}</code></pre>
                <p class="mt-3 text-slate-200">
                    The runtime currently handles <code>defend</code>, <code>attack</code>, and <code>spell</code>.
                </p>
            </section>

            <section class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <article class="p-5 rounded-lg border border-slate-800 bg-slate-900">
                    <h2 class="text-xl font-semibold">What makes a move legal</h2>
                    <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                        <li>The request needs a non-empty <code>id</code>, <code>source</code>, and <code>type</code>.</li>
                        <li><code>source</code> must be a living character on the active side.</li>
                        <li>The source needs enough stamina and must still be allowed to act.</li>
                        <li>If targets are provided, they must resolve to valid characters.</li>
                        <li>Illegal moves are rejected and logged by the engine.</li>
                    </ul>
                </article>

                <article class="p-5 rounded-lg border border-slate-800 bg-slate-900">
                    <h2 class="text-xl font-semibold">Defend</h2>
                    <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                        <li>Marks the source as defended.</li>
                        <li>Costs no stamina.</li>
                        <li>Use it when you want to buy time instead of forcing damage.</li>
                    </ul>
                </article>

                <article class="p-5 rounded-lg border border-slate-800 bg-slate-900">
                    <h2 class="text-xl font-semibold">Attack</h2>
                    <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                        <li>The action id must match one of the source character's attacks.</li>
                        <li>Attacks deal damage and generate stack.</li>
                        <li><code>CONTROLLER</code> characters generate an extra point of stack on attack.</li>
                        <li>Attacks are the safest way to build resources for later spells.</li>
                    </ul>
                </article>

                <article class="p-5 rounded-lg border border-slate-800 bg-slate-900">
                    <h2 class="text-xl font-semibold">Spell</h2>
                    <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                        <li>Spell options come from the character's own list plus the team spell pool.</li>
                        <li>The spell must be off cooldown and affordable from stack.</li>
                        <li><code>CASTER</code> characters get a one-stack discount.</li>
                        <li>Spells are where fights swing, but they spend tempo as well as resources.</li>
                    </ul>
                </article>
            </section>

            <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Why matches end quickly</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li>The engine checks for a winner after every action.</li>
                    <li>When one side runs out of living characters, the match ends immediately.</li>
                    <li>Strong turns often come from a single attack chain followed by a decisive spell.</li>
                    <li>Stamina debt matters: if you spend too much now, you may skip future turns.</li>
                </ul>
            </section>

            <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">What status tells you</h2>
                <p class="mt-3 text-slate-200">
                    The live status snapshot is what your bot should use for decisions. It includes:
                </p>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li>Your team, the enemy team, and the current stack.</li>
                    <li>For each character: identity, class, HP, stamina, actions, and effects.</li>
                    <li>Available attacks and spells, including cooldown and stack availability.</li>
                    <li>Enough context to choose a move without guessing.</li>
                </ul>
                <p class="mt-3 text-sm text-slate-300">
                    If a spell looks available in status, it is legal to consider for the next action.
                </p>
            </section>

            <section class="mt-6 p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Debugging tips</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li>Log the prompt type, match id, and action you sent.</li>
                    <li>Check the live status whenever a move looks legal but fails.</li>
                    <li>Keep one baseline bot around so you always have something to compare against.</li>
                    <li>When in doubt, prefer the move that is easiest to explain later.</li>
                </ul>
            </section>
        </main>
    );
}
