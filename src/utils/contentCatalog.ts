export type EndpointCharacterAttack = {
    id: string;
    name: string;
    element: string;
};

export type EndpointEffect = {
    name: string;
    description: string;
};

export type EndpointCharacterSpell = {
    id: string;
    name: string;
    element: string;
    maxTargets: number;
    cooldown: number;
    stamina: number;
    stackCost: number;
    description: string;
    effects: EndpointEffect[];
};

export type EndpointCharacter = {
    id: string;
    name: string;
    class: string;
    primary: string;
    secondary: string;
    attacks: EndpointCharacterAttack[];
    uniqueSpells: EndpointCharacterSpell[];
};

export type EndpointSpellElement = {
    id: string;
    op: string;
};

export type EndpointSpell = {
    id: string;
    element: EndpointSpellElement;
    maxTargets: number;
    stamina: number;
    stackCost: number;
    effects: EndpointEffect[];
    description: string;
};

export type CharactersResponse = {
    success: boolean;
    characters?: EndpointCharacter[];
};

export type SpellsResponse = {
    success: boolean;
    spells?: EndpointSpell[];
};

export function normalizeCharacters(characters: EndpointCharacter[]): EndpointCharacter[] {
    return characters.map(character => ({
        ...character,
        class: character.class.trim(),
        primary: character.primary.trim(),
        secondary: character.secondary.trim(),
    }));
}

export function classBreakdown(characters: EndpointCharacter[]): Array<{ label: string; count: number }> {
    const counts = new Map<string, number>();

    for (const character of characters) {
        counts.set(character.class, (counts.get(character.class) ?? 0) + 1);
    }

    return Array.from(counts.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function elementBreakdown(spells: EndpointSpell[]): Array<{ label: string; count: number }> {
    const counts = new Map<string, number>();

    for (const spell of spells) {
        counts.set(spell.element.id, (counts.get(spell.element.id) ?? 0) + 1);
    }

    return Array.from(counts.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}