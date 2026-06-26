import { useState, useEffect } from 'preact/hooks';
import parseGameLog, { Turn } from '../utils/parseGameLog';

import CharacterStatus from './viewer/CharacterStatus';
import CharacterEmulator, { Character } from '../utils/characterEmulator';

type Game = {
    id: string,
    north: string,
    north_characters: Character[],
    north_spellpool: string[],
    south: string,
    south_characters: Character[],
    south_spellpool: string[],
    status: string,
    nwin: boolean,
    length: number,
    log: string,
    created_at: string,
};

const ACTION_TIMER = 200;

export default function GameViewer({ gameId }: { gameId: string }) {
    const [game, setGame] = useState(undefined as Game | undefined);
    const [turns, setTurns] = useState([] as Turn[]);
    const [gameLog, setGameLog] = useState([] as string[]);
    const [autoplay, setAutoplay] = useState(false);

    const [currentTurn, setCurrentTurn] = useState(0);
    const [currentAction, setCurrentAction] = useState(0);

    const northCharacters = (game?.north_characters || []).map(char => {
        const charEmu =  new CharacterEmulator(char);

        for (const turn of turns) {
            if (turns.indexOf(turn) > currentTurn) break;
            if (turn.active === 'north') charEmu.regainStamina();

            for (const action of turn.actions) {
                if (turn.actions.indexOf(action) > currentAction) break;
                if (action.source === charEmu.id && action.type !== 'defend') charEmu.useStamina(action.type === 'spell' ? 5 : 1);
                if (turn.active === 'south' && turns.indexOf(turn) !== 0) charEmu.regainStamina();
                for (const effect of action.effects || []) {
                    if (effect.target === charEmu.id) charEmu.hp -= effect.amount;
                }
            }
        }

        return charEmu;
    });

    const southCharacters = (game?.south_characters || []).map(char => {
        const charEmu = new CharacterEmulator(char);
        if (currentTurn === 0) charEmu.defended = true;

        for (const turn of turns) {
            if (turns.indexOf(turn) > currentTurn) break;
            if (turn.active === 'south') charEmu.regainStamina();

            for (const action of turn.actions) {
                if (turn.actions.indexOf(action) > currentAction) break;
                if (action.source === charEmu.id && action.type !== 'defend') charEmu.useStamina(action.type === 'spell' ? 5 : 1);
                if (turn.active === 'north') charEmu.regainStamina();
                for (const effect of action.effects || []) {
                    if (effect.target === charEmu.id) charEmu.hp -= effect.amount;
                }
            }
        }

        return charEmu;
    });

    useEffect(() => {
        fetch(import.meta.env.VITE_API_HOST + '/game/' + gameId)
            .then(res => res.json())
            .then(data => {
                setGame(data.game);
                setTurns(parseGameLog(data.game.log, data.game.south_characters));
                setCurrentTurn(0);
                setCurrentAction(0);
                setAutoplay(false);
            })
            .catch(console.error);
    }, [gameId]);

    useEffect(() => {
        const logBox = document.getElementById(`${gameId}-log`);
        if (logBox) logBox.scrollTop = logBox.scrollHeight;
    }, [gameId, gameLog]);

    useEffect(() => {
        if (!turns.length) return;

        const ugl = ['Game Start!']; // Updated Game Log
        for (let i = 0; i <= Math.min(currentTurn, turns.length); i++) {
            const turn = turns[i];
            ugl.push(`Turn start: ${turn.active}`);

            for (const action of turn.actions) {
                if (i >= currentTurn && turn.actions.indexOf(action) > currentAction) break;
                let log = `${action.id} - `;

                for (const effect of action?.effects || []) {
                    const target = [...northCharacters || [], ...southCharacters || []].at(parseInt(atob(effect.target)) - 1);
                    if (target && effect.amount) log += `${target.name} ${effect.amount > 0 ? `-${effect.amount}` : `+${effect.amount}`} `;
                }

                ugl.push(log);
            }
        }
        setGameLog(ugl);
    }, [turns, currentTurn, currentAction, northCharacters, southCharacters]);

    useEffect(() => {
        if (!autoplay) return;

        const intvl = setInterval(() => {
            if (currentAction > turns[currentTurn].actions.length - 1) {
                setCurrentAction(currentAction + 1);
            }

            setCurrentTurn((c) => {
                if (c < turns.length - 1) {
                    return c + 1;
                }
                setCurrentAction(0);
                setAutoplay(false);
                return c;
            });
        }, ACTION_TIMER);

        return () => {
            clearInterval(intvl);
        };
    }, [autoplay, turns, currentTurn, currentAction]);

    if (!game || !gameLog || !turns) return;

    return (
        <div>
            HotGuy24
            <div class="flex">
                { northCharacters.map(char => <CharacterStatus char={char} />) }
            </div>

            <div class="flex flex-col-reverse h-48 overflow-y-scroll mt-4 scrollbar-none" id={`${gameId}-log`}>
                {gameLog.toReversed().map(t => (<p>{t}</p>))}
            </div>

            WeeWoo1337
            <div class="flex">
                { southCharacters.map(char => <CharacterStatus char={char} />) }
            </div>

            <button disabled={currentTurn === turns.length - 1} onClick={() => setAutoplay(!autoplay)}>▶️</button>
            <button disabled={currentTurn === turns.length - 1} onClick={() => setCurrentTurn(currentTurn + 1)}>➡️</button>
            <button disabled={currentTurn === 0} onClick={() => setCurrentTurn(currentTurn - 1)}>⬅️</button>
            <button onClick={() => setCurrentTurn(0)}>🔄</button>
        </div>
    );
}
