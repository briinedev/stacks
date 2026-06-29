import { Character } from './characterEmulator';

export type Effect = {
    target: string,
    amount: number,
};

export type Action = {
    id: string,
    source: string,
    targets?: string[],
    type: 'spell' | 'attack' | 'defend',
    effects?: Effect[],
};

export type Turn = {
    active: 'north' | 'south',
    actions: Action[],
    wins?: boolean,
};


export default function parseGameLog(log: string, southCharacterIds: Character[]) {
    const entries = log.split('|');
    const turns = [
        {
            active: 'south',
            actions: southCharacterIds.map(char => ({ id: 'defend', source: char.id, type: 'defend' }))
        }
    ] as Turn[];

    for (const entry of entries) {
        if (entry === 'gs!' || entry === 'st:n') {
            turns.push({
                active: 'north',
                actions: [],
            });
        } else if (entry === 'st:s') {
            turns.push({
                active: 'south',
                actions: [],
            });
        } else {
            const currentTurn = turns.at(-1)!;

            if (/^[1-6]:[asd]:[a-z\-_]+:[1-6,]+$/.test(entry)) { // Attack or Spell
                const [sourceNum, type, id, targetString] = entry.split(':');
                const source = btoa(sourceNum);
                const targets = targetString.split(',').map(n => btoa(n));

                currentTurn.actions.push({
                    id,
                    source,
                    targets,
                    type: type === 'a' ? 'attack' : 'spell',
                    effects: [],
                });
            } else if (/^[1-6]:d$/.test(entry)) { // Defend
                const [idNum] = entry.split(':');

                currentTurn.actions.push({
                    id: 'defend',
                    source: btoa(idNum),
                    type: 'defend',
                });
            } else if (['nw!', 'sw!'].includes(entry)) { // Win Condition
                currentTurn.wins = true;
            } else { // Effects
                const lastAction = currentTurn.actions.at(-1)!;

                if (/^[1-6]:d:[-0-9]+/.test(entry)) {
                    const [targetNum, , amount] = entry.split(':');
                    lastAction.effects!.push({
                        target: btoa(targetNum),
                        amount: parseInt(amount),
                    });
                }
            }
        }
    }

    return turns;
}
