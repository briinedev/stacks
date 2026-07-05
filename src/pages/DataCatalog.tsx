import { useEffect, useMemo, useState } from 'preact/hooks';

import SiteLayout from '../components/SiteLayout';
import {
    CharactersResponse,
    EndpointCharacter,
    EndpointSpell,
    SpellsResponse,
    classBreakdown,
    elementBreakdown,
    normalizeCharacters,
} from '../utils/contentCatalog';

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
        <SiteLayout>
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
                        <p class="mt-1 text-sm text-slate-300">From <code>/characters</code></p>
                    </article>
                    <article class="p-5 rounded-lg border border-slate-800 bg-slate-900">
                        <h2 class="text-lg font-semibold">Spells</h2>
                        <p class="mt-2 text-3xl font-bold">{spells.length}</p>
                        <p class="mt-1 text-sm text-slate-300">From <code>/spells</code></p>
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
                            <article key={character.id} class="rounded border border-slate-700 bg-slate-950 p-4">
                                <h3 class="text-lg font-semibold">{character.name}</h3>
                                <p class="mt-1 text-sm text-slate-300">id: {character.id}</p>
                                <p class="mt-1 text-sm text-slate-300">class: {character.class}</p>
                                <p class="mt-1 text-sm text-slate-300">elements: {character.primary} / {character.secondary}</p>

                                <div class="mt-3">
                                    <h4 class="font-medium">Attacks</h4>
                                    <ul class="mt-1 list-disc pl-5 text-sm text-slate-200 space-y-1">
                                        {character.attacks.map(attack => (
                                            <li key={attack.id}>{attack.name} ({attack.id}) - {attack.element}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div class="mt-3">
                                    <h4 class="font-medium">Unique Spells</h4>
                                    <ul class="mt-1 list-disc pl-5 text-sm text-slate-200 space-y-1">
                                        {character.uniqueSpells.map(spell => (
                                            <li key={spell.id}>
                                                {spell.name} ({spell.id}) - {spell.element}, targets: {spell.maxTargets}, cooldown: {spell.cooldown}, stack: {spell.stackCost}
                                            </li>
                                        ))}
                                    </ul>
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
                        <div class="mt-4 overflow-x-auto">
                            <table class="w-full min-w-[860px] text-left border-collapse">
                                <thead>
                                    <tr class="border-b border-slate-700">
                                        <th class="py-2 pr-3">Spell</th>
                                        <th class="py-2 pr-3">Element</th>
                                        <th class="py-2 pr-3">Opposes</th>
                                        <th class="py-2 pr-3">Targets</th>
                                        <th class="py-2 pr-3">Stamina</th>
                                        <th class="py-2 pr-3">Stack</th>
                                        <th class="py-2">Effects</th>
                                    </tr>
                                </thead>
                                <tbody class="text-slate-200">
                                    {filteredSpells.map(spell => (
                                        <tr class="border-b border-slate-800" key={spell.id}>
                                            <td class="py-2 pr-3">{spell.id}</td>
                                            <td class="py-2 pr-3">{spell.element.id}</td>
                                            <td class="py-2 pr-3">{spell.element.op}</td>
                                            <td class="py-2 pr-3">{spell.maxTargets}</td>
                                            <td class="py-2 pr-3">{spell.stamina}</td>
                                            <td class="py-2 pr-3">{spell.stackCost}</td>
                                            <td class="py-2">{spell.effects.length}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </SiteLayout>
    );
}