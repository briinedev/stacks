export const CHAR_MAX_HP = 12500;

export type Character = {
    id: string,
    name: string,
    class: string,
    primaryElement: { id: string, op: string },
    secondaryElement: { id: string, op: string },
};

export default class CharacterEmulator {
    id: string;
    name: string;
    primary: string;
    secondary: string;
    hp: number;
    defended: boolean;
    stamina: number;
    maxStamina: number;

    constructor(char: Character, defended = false) {
        this.id = char.id;
        this.name = char.name;
        this.primary = char.primaryElement.id;
        this.secondary = char.secondaryElement.id;
        this.hp = CHAR_MAX_HP;
        this.defended = defended;
        this.stamina = 2;
        this.maxStamina = char.class === 'defender' ? 5 : 3;
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
