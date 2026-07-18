import { useEffect, useMemo, useState } from 'preact/hooks';
import {
    IconBolt,
    IconRefresh,
    IconSparkles,
    IconSword,
    IconTargetArrow,
    IconWand,
} from '@tabler/icons-preact';

import {
    CharactersResponse,
    EndpointCharacter,
    EndpointSpell,
    SpellsResponse,
    classBreakdown,
    elementBreakdown,
    humanizeElement,
    humanizeId,
    normalizeCharacters,
} from '../utils/contentCatalog';
import { getClassMeta } from '../utils/characterEmulator';
import { ClassIcon, ElementBadge, ElementIcon } from '../components/shared/CombatPresentation';

function StatPill({ icon, label, value }: { icon: preact.ComponentChildren; label: string; value: string | number }) {
    return (
        <div class="rounded-lg border border-slate-700/80 bg-slate-950/70 px-3 py-2">
            <div class="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                {icon}
                <span>{label}</span>
            </div>
            <div class="mt-1 text-sm font-semibold text-slate-100">{value}</div>
        </div>
    );
}

export default function DataCatalog() {
    const [characters, setCharacters] = useState([] as EndpointCharacter[]);
    const [spells, setSpells] = useState([] as EndpointSpell[]);

    const [charactersError, setCharactersError] = useState(null as string | null);
    const [spellsError, setSpellsError] = useState(null as string | null);

    const [loadingCharacters, setLoadingCharacters] = useState(true);
    const [loadingSpells, setLoadingSpells] = useState(true);

    const [characterQuery, setCharacterQuery] = useState('');
    const [spellQuery, setSpellQuery] = useState('');

    useEffect(() => {
        let canceled = false;
        setLoadingCharacters(true);
        setCharactersError(null);

        fetch(import.meta.env.VITE_API_HOST + '/characters')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch /characters');
                return res.json() as Promise<CharactersResponse>;
            })
            .then(data => {
                if (canceled) return;
                setCharacters(normalizeCharacters(data.characters ?? []));
            })
            .catch((error: unknown) => {
                if (canceled) return;
                const message = error instanceof Error ? error.message : 'Failed to fetch /characters';
                setCharactersError(message);
                setCharacters([]);
            })
            .finally(() => {
                if (!canceled) setLoadingCharacters(false);
            });

        return () => {
            canceled = true;
        };
    }, []);

    useEffect(() => {
        let canceled = false;
        setLoadingSpells(true);
        setSpellsError(null);

        fetch(import.meta.env.VITE_API_HOST + '/spells')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch /spells');
                return res.json() as Promise<SpellsResponse>;
            })
            .then(data => {
                if (canceled) return;
                setSpells(data.spells ?? []);
            })
            .catch((error: unknown) => {
                if (canceled) return;
                const message = error instanceof Error ? error.message : 'Failed to fetch /spells';
                setSpellsError(message);
                setSpells([]);
            })
            .finally(() => {
                if (!canceled) setLoadingSpells(false);
            });

        return () => {
            canceled = true;
        };
    }, []);

    const filteredCharacters = useMemo(() => {
        const q = characterQuery.trim().toLowerCase();
        if (!q) return characters;

        return characters.filter(character => (
            character.name.toLowerCase().includes(q)
            || character.id.toLowerCase().includes(q)
            || character.class.toLowerCase().includes(q)
            || character.primary.toLowerCase().includes(q)
            || character.secondary.toLowerCase().includes(q)
        ));
    }, [characters, characterQuery]);

    const filteredSpells = useMemo(() => {
        const q = spellQuery.trim().toLowerCase();
        if (!q) return spells;

        return spells.filter(spell => (
            spell.id.toLowerCase().includes(q)
            || spell.description.toLowerCase().includes(q)
            || spell.element.id.toLowerCase().includes(q)
            || spell.element.op.toLowerCase().includes(q)
        ));
    }, [spells, spellQuery]);

    const classStats = useMemo(() => classBreakdown(characters), [characters]);
    const spellElementStats = useMemo(() => elementBreakdown(spells), [spells]);

    return (
        <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <h1 class="text-3xl sm:text-5xl font-bold">Data Catalog</h1>
            <p class="mt-3 text-slate-300 max-w-3xl">
                Live API-backed overview of currently available characters and spells.
                This page is designed as an expandable foundation for future data docs, filters, and balance notes.
            </p>

            <section class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <article class="p-5 rounded-lg border border-slate-800 bg-slate-900">
                    <h2 class="text-lg font-semibold">Characters</h2>
                    <p class="mt-2 text-3xl font-bold">{characters.length}</p>
                    <p class="mt-1 text-sm text-slate-300">From /characters</p>
                </article>
                <article class="p-5 rounded-lg border border-slate-800 bg-slate-900">
                    <h2 class="text-lg font-semibold">Spells</h2>
                    <p class="mt-2 text-3xl font-bold">{spells.length}</p>
                    <p class="mt-1 text-sm text-slate-300">From /spells</p>
                </article>
                <article class="p-5 rounded-lg border border-slate-800 bg-slate-900">
                    <h2 class="text-lg font-semibold">Endpoint Health</h2>
                    <p class="mt-2 text-sm text-slate-200">
                        Characters: {loadingCharacters ? 'loading' : (charactersError ? 'error' : 'ok')}
                    </p>
                    <p class="mt-1 text-sm text-slate-200">
                        Spells: {loadingSpells ? 'loading' : (spellsError ? 'error' : 'ok')}
                    </p>
                </article>
            </section>

            <section class="mt-6 p-5 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Character Availability</h2>
                <div class="mt-4 flex flex-wrap gap-2">
                    {classStats.map(item => (
                        <span class="px-3 py-1 rounded-full border border-slate-700 bg-slate-950 text-sm" key={item.label}>
                            {item.label}: {item.count}
                        </span>
                    ))}
                </div>

                <label class="mt-4 block text-sm text-slate-300" for="character-search">Filter characters</label>
                <input
                    id="character-search"
                    class="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                    placeholder="Search by name, id, class, or element"
                    value={characterQuery}
                    onInput={event => setCharacterQuery((event.target as HTMLInputElement).value)}
                />

                {loadingCharacters && <p class="mt-4 text-slate-300">Loading characters...</p>}
                {charactersError && <p class="mt-4 text-red-300">Unable to load characters: {charactersError}</p>}

                <div class="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {!loadingCharacters && !charactersError && filteredCharacters.map(character => (
                        <article key={character.id} class="rounded-2xl border border-slate-700 bg-slate-950 p-4 sm:p-5 shadow-lg shadow-slate-950/30">
                            <div class="flex items-start justify-between gap-3">
                                <div>
                                    <div class="flex items-center gap-2">
                                        <ClassIcon classType={character.class} size={18} className="inline align-text-bottom" />
                                        <h3 class="text-lg font-semibold text-slate-100">{character.name}</h3>
                                    </div>
                                    <p class="mt-1 text-sm text-slate-400">{humanizeId(character.id)}</p>
                                </div>
                                <span class="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs uppercase tracking-wide text-slate-300">
                                    {getClassMeta(character.class).label}
                                </span>
                            </div>

                            <div class="mt-4 flex flex-wrap gap-2">
                                <ElementBadge element={character.primary} />
                                <ElementBadge element={character.secondary} />
                            </div>

                            <div class="mt-4">
                                <h4 class="font-medium text-slate-100">Attacks</h4>
                                <div class="mt-2 space-y-2">
                                    {character.attacks.map(attack => (
                                        <div key={attack.id} class="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3 text-sm text-slate-200">
                                            <div class="flex items-center justify-between gap-3">
                                                <div class="font-medium text-slate-100">{attack.name}</div>
                                            </div>
                                            <ElementBadge element={attack.element} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div class="mt-4">
                                <h4 class="font-medium text-slate-100">Passives</h4>
                                <div class="mt-2 space-y-2">
                                    {character.passives.map(passive => (
                                        <div key={passive.name} class="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-3">
                                            <div class="flex items-center gap-2 text-sm font-medium text-cyan-200">
                                                <IconSparkles size={14} />
                                                <span>{passive.name}</span>
                                            </div>
                                            <p class="mt-1 text-sm text-slate-300">{passive.description}</p>
                                        </div>
                                    ))}
                                    {character.passives.length === 0 ? <span class="text-sm text-slate-500">None</span> : null}
                                </div>
                            </div>

                            <div class="mt-4">
                                <h4 class="font-medium text-slate-100">Unique Spell</h4>
                                <div class="mt-2 space-y-3">
                                    {character.uniqueSpells.map(spell => (
                                        <div key={spell.id} class="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                                            <div class="flex items-start justify-between gap-3">
                                                <div>
                                                    <div class="flex items-center gap-2 text-slate-100">
                                                        <IconWand size={16} class="text-cyan-300" />
                                                        <span class="font-medium">{spell.name}</span>
                                                    </div>
                                                </div>
                                                <ElementBadge element={spell.element} />
                                            </div>

                                            <p class="mt-2 text-sm text-slate-300">{spell.description}</p>

                                            <div class="mt-3 grid grid-cols-3 gap-2">
                                                <StatPill icon={<IconTargetArrow size={14} class="text-slate-300" />} label="Targets" value={spell.maxTargets} />
                                                <StatPill icon={<IconRefresh size={14} class="text-amber-300" />} label="Cooldown" value={spell.cooldown} />
                                                <StatPill icon={<IconBolt size={14} class="text-orange-300" />} label="Stack" value={spell.stackCost} />
                                            </div>

                                            {spell.effects.length > 0 ? (
                                                <div class="mt-3 space-y-2">
                                                    {spell.effects.map(effect => (
                                                        <div key={effect.name} class="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-3">
                                                            <div class="flex items-center gap-2 text-sm font-medium text-fuchsia-200">
                                                                <IconSparkles size={13} />
                                                                <span>{effect.name}</span>
                                                            </div>
                                                            <p class="mt-1 text-sm text-slate-300">{effect.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section class="mt-6 p-5 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Spell Availability</h2>
                <div class="mt-4 flex flex-wrap gap-2">
                    {spellElementStats.map(item => (
                        <span class="px-3 py-1 rounded-full border border-slate-700 bg-slate-950 text-sm" key={item.label}>
                            {item.label}: {item.count}
                        </span>
                    ))}
                </div>

                <label class="mt-4 block text-sm text-slate-300" for="spell-search">Filter spells</label>
                <input
                    id="spell-search"
                    class="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                    placeholder="Search by spell id, element, or description"
                    value={spellQuery}
                    onInput={event => setSpellQuery((event.target as HTMLInputElement).value)}
                />

                {loadingSpells && <p class="mt-4 text-slate-300">Loading spells...</p>}
                {spellsError && <p class="mt-4 text-red-300">Unable to load spells: {spellsError}</p>}

                {!loadingSpells && !spellsError && (
                    <div class="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {filteredSpells.map(spell => (
                            <article class="rounded-2xl border border-slate-700 bg-slate-950 p-4 sm:p-5 shadow-lg shadow-slate-950/30" key={spell.id}>
                                <div class="flex items-start justify-between gap-3">
                                    <div>
                                        <div class="flex items-center gap-2 text-slate-100">
                                            <IconWand size={17} class="text-cyan-300" />
                                            <h3 class="text-lg font-semibold">{humanizeId(spell.id)}</h3>
                                        </div>
                                        <p class="mt-1 text-sm text-slate-400">{spell.id}</p>
                                    </div>
                                    <ElementBadge element={spell.element.id} />
                                </div>

                                <p class="mt-3 text-sm text-slate-300">{spell.description}</p>

                                <div class="mt-4 flex flex-wrap gap-2">
                                    <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200">
                                        <IconTargetArrow size={14} class="text-slate-300" />
                                        Targets: {spell.maxTargets}
                                    </span>
                                    <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200">
                                        <IconSword size={14} class="text-amber-300" />
                                        Stamina: {spell.stamina}
                                    </span>
                                    <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200">
                                        <IconBolt size={14} class="text-orange-300" />
                                        Stack: {spell.stackCost}
                                    </span>
                                    <span class="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200">
                                        <ElementIcon element={spell.element.op} size={12} />
                                        Opposes: {humanizeElement(spell.element.op)}
                                    </span>
                                </div>

                                <div class="mt-4">
                                    <h4 class="font-medium text-slate-100">Effects</h4>
                                    <div class="mt-2 space-y-2">
                                        {spell.effects.map(effect => (
                                            <div key={effect.name} class="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-3 py-3">
                                                <div class="flex items-center gap-2 text-sm font-medium text-fuchsia-200">
                                                    <IconSparkles size={13} />
                                                    <span>{effect.name}</span>
                                                </div>
                                                <p class="mt-1 text-sm text-slate-300">{effect.description}</p>
                                            </div>
                                        ))}
                                        {spell.effects.length === 0 ? <span class="text-sm text-slate-500">No secondary effects</span> : null}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}