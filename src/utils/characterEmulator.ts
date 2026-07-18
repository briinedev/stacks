export const CHAR_MAX_HP = 12500;

export type Attack = {
    id: string,
    name: string,
    stamina: number,
    currentCooldown: number,
    element: {
        id: string,
        op: string,
    },
};

export type Spell = {
    id: string,
    name: string,
    stamina: number,
    stackCost: number,
    element: {
        id: string,
        op: string,
    },
};

export type Passive = {
    name: string,
    description?: string,
};

export type Character = {
    id: string,
    name: string,
    class: string,
    primaryElement: { id: string, op: string },
    secondaryElement: { id: string, op: string },
    attacks: Attack[],
    spells: Spell[],
    passives?: Passive[],
};

export type ClassIconKey = 'assassin' | 'defender' | 'caster' | 'controller' | 'unknown';

export function getClassMeta(className: string): { iconKey: ClassIconKey; label: string } {
    switch (className?.toLowerCase()) {
        case 'assassin':
            return { iconKey: 'assassin', label: 'Assassin' };
        case 'defender':
            return { iconKey: 'defender', label: 'Defender' };
        case 'caster':
            return { iconKey: 'caster', label: 'Caster' };
        case 'controller':
            return { iconKey: 'controller', label: 'Controller' };
        default:
            return { iconKey: 'unknown', label: className || 'Unknown' };
    }
}

export default class CharacterEmulator {
    id: string;
    name: string;
    class: string;
    primary: string;
    secondary: string;
    hp: number;
    defended: boolean;
    stamina: number;
    maxStamina: number;
    spells: Spell[];
    attacks: Attack[];
    passives: Passive[];

    constructor(char: Character, defended = false) {
        this.id = char.id;
        this.name = char.name;
        this.class = char.class;
        this.primary = char.primaryElement.id;
        this.secondary = char.secondaryElement.id;
        this.hp = CHAR_MAX_HP;
        this.defended = defended;
        this.stamina = 3;
        this.maxStamina = char.class === 'defender' ? 8 : 5;
        this.spells = char.spells;
        this.attacks = char.attacks;
        this.passives = char.passives || [];
    }

    useStamina(num = 1) {
        this.stamina -= num;
    }

    regainStamina() {
        if (this.hp < 1) return;
        this.stamina = Math.min(this.stamina + 1, this.maxStamina);
    }

    applyStaminaChange(amount: number) {
        this.stamina = Math.min(Math.max(this.stamina + amount, 0), this.maxStamina);
    }

    applyHpChange(hp: number) {
        this.hp -= hp;
        this.hp = Math.min(Math.max(this.hp, 0), CHAR_MAX_HP);
    }
}
