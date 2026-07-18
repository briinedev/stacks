import { Character } from './characterEmulator';

export type Effect = {
    kind: 'hp' | 'stack' | 'effect',
    target?: string,
    amount?: number,
    source?: string,
    op?: 'g' | 's',
    element?: string,
    effectId?: string,
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
                    effects: [],
                });
            } else if (['nw!', 'sw!'].includes(entry)) { // Win Condition
                currentTurn.wins = true;
            } else { // Effects
                let lastAction = currentTurn.actions.at(-1);
                if (!lastAction) {
                    lastAction = {
                        id: 'system',
                        source: 'system',
                        type: 'defend',
                        effects: [],
                    };
                    currentTurn.actions.push(lastAction);
                }

                if (!lastAction.effects) {
                    lastAction.effects = [];
                }

                if (/^[1-6]:d:[-0-9]+(?::[1-6])?$/.test(entry)) {
                    const [targetNum, , amount, sourceNum] = entry.split(':');
                    lastAction.effects!.push({
                        kind: 'hp',
                        target: btoa(targetNum),
                        amount: parseInt(amount),
                        source: sourceNum ? btoa(sourceNum) : undefined,
                    });
                } else if (/^k:[gs]:[a-z]+:[0-9]+(?::[1-6])?$/.test(entry)) {
                    const [, op, element, amount, sourceNum] = entry.split(':');
                    lastAction.effects!.push({
                        kind: 'stack',
                        op: op as 'g' | 's',
                        element,
                        amount: parseInt(amount),
                        source: sourceNum ? btoa(sourceNum) : undefined,
                    });
                } else if (/^e:[ae]:[1-6]:[a-z0-9_]+(?::[1-6])?$/.test(entry)) {
                    const [, op, targetNum, effectId, sourceNum] = entry.split(':');
                    lastAction.effects!.push({
                        kind: 'effect',
                        op: op === 'a' ? 'g' : 's',
                        target: btoa(targetNum),
                        effectId,
                        source: sourceNum ? btoa(sourceNum) : undefined,
                    });
                }
            }
        }
    }

    return turns;
}
