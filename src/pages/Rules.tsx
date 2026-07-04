import SiteLayout from '../components/SiteLayout';

export default function Rules() {
    return (
        <SiteLayout>
            <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <h1 class="text-3xl sm:text-5xl font-bold">Rules</h1>
                <p class="mt-3 text-slate-300 max-w-3xl">
                    Briine Stacks is deterministic. Victory comes from sequencing, stack pressure, and efficient action usage.
                </p>

                <section class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <article class="p-5 rounded-lg border border-slate-800 bg-slate-900">
                        <h2 class="text-xl font-semibold">Match Flow</h2>
                        <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                            <li>Each side fields 3 characters.</li>
                            <li>Teams alternate turns.</li>
                            <li>A character acts once per side turn.</li>
                            <li>When all three are spent, turn swaps.</li>
                        </ul>
                    </article>

                    <article class="p-5 rounded-lg border border-slate-800 bg-slate-900">
                        <h2 class="text-xl font-semibold">Actions</h2>
                        <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                            <li>Attack: low stamina, generates stack.</li>
                            <li>Spell: high impact, consumes stack and obeys cooldown.</li>
                            <li>Defend: damage mitigation and tempo control.</li>
                        </ul>
                    </article>

                    <article class="p-5 rounded-lg border border-slate-800 bg-slate-900">
                        <h2 class="text-xl font-semibold">The Stack</h2>
                        <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                            <li>Shared elemental economy across both teams.</li>
                            <li>Controllers accelerate stack generation.</li>
                            <li>Casters often reduce spell stack cost.</li>
                        </ul>
                    </article>

                    <article class="p-5 rounded-lg border border-slate-800 bg-slate-900">
                        <h2 class="text-xl font-semibold">Win Condition</h2>
                        <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                            <li>Eliminate all opposing characters.</li>
                            <li>Dead characters cannot act or regain stamina.</li>
                            <li>Replay logs are authoritative for analysis.</li>
                        </ul>
                    </article>
                </section>
            </main>
        </SiteLayout>
    );
}
