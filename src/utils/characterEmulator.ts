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

export type Character = {
    id: string,
    name: string,
    class: string,
    primaryElement: { id: string, op: string },
    secondaryElement: { id: string, op: string },
    attacks: Attack[],
    spells: Spell[],
};

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

    constructor(char: Character, defended = false) {
        this.id = char.id;
        this.name = char.name;
        this.class = char.class;
        this.primary = char.primaryElement.id;
        this.secondary = char.secondaryElement.id;
        this.hp = CHAR_MAX_HP;
        this.defended = defended;
        this.stamina = 2;
        this.maxStamina = char.class === 'defender' ? 5 : 3;
        this.spells = char.spells;
        this.attacks = char.attacks;
    }

    useStamina(num = 1) {
        this.stamina -= num;
    }

    regainStamina() {
        this.stamina = Math.min(this.stamina + 1, this.maxStamina);
    }

    applyHpChange(hp: number) {
        this.hp -= hp;
    }
}
