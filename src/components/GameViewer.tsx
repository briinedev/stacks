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
    const [currentAction, setCurrentAction] = useState(3);

    const shouldIncludeAction = (turnIndex: number, actionIndex: number) => {
        if (turnIndex < currentTurn) return true;
        if (turnIndex > currentTurn) return false;
        return actionIndex <= currentAction;
    };

    useEffect(() => {
        const clampActionIndex = (turnIndex: number, actionIndex: number) => {
            const actionCount = turns[turnIndex]?.actions.length ?? 0;
            return actionCount === 0 ? 0 : Math.min(actionIndex, actionCount - 1);
        };

        if (!turns.length) return;
        setCurrentAction((prev) => clampActionIndex(currentTurn, prev));
    }, [currentTurn, turns]);

    const currentTurnActions = turns[currentTurn]?.actions.length ?? 0;
    const canGoNext = turns.length > 0 && (currentTurn < turns.length - 1 || currentAction < currentTurnActions - 1);
    const canGoPrev = currentTurn > 0 || currentAction > 0;

    const goNext = () => {
        if (currentAction < currentTurnActions - 1) {
            setCurrentAction((prev) => prev + 1);
        } else if (currentTurn < turns.length - 1) {
            setCurrentTurn((prev) => prev + 1);
            setCurrentAction(0);
        }
    };

    const goPrev = () => {
        if (currentAction > 0) {
            setCurrentAction((prev) => prev - 1);
        } else if (currentTurn > 0) {
            const previousTurn = currentTurn - 1;
            const previousActionCount = turns[previousTurn]?.actions.length ?? 0;
            setCurrentTurn(previousTurn);
            setCurrentAction(previousActionCount > 0 ? previousActionCount - 1 : 0);
        }
    };

    const northCharacters = (game?.north_characters || []).map(char => {
        const charEmu = new CharacterEmulator(char);

        for (let ti = 0; ti < turns.length; ti++) {
            if (ti > currentTurn) break;
            const turn = turns[ti];

            if (turn.active === 'north') charEmu.regainStamina();

            for (let ai = 0; ai < turn.actions.length; ai++) {
                if (!shouldIncludeAction(ti, ai)) break;
                const action = turn.actions[ai];

                if (action.source === charEmu.id && action.type !== 'defend') charEmu.useStamina(action.type === 'spell' ? 5 : 1);
                if (turn.active === 'south' && ti !== 0) charEmu.regainStamina();
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

        for (let ti = 0; ti < turns.length; ti++) {
            if (ti > currentTurn) break;
            const turn = turns[ti];

            if (turn.active === 'south') charEmu.regainStamina();

            for (let ai = 0; ai < turn.actions.length; ai++) {
                if (!shouldIncludeAction(ti, ai)) break;
                const action = turn.actions[ai];

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
                setCurrentAction(3);
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

        const ugl = ['Game Start!'];
        for (let i = 0; i < turns.length; i++) {
            if (i > currentTurn) break;
            const turn = turns[i];
            ugl.push(`Turn start: ${turn.active}`);

            for (let ai = 0; ai < turn.actions.length; ai++) {
                if (i === currentTurn && ai > currentAction) break;
                const action = turn.actions[ai];
                const source = [...northCharacters, ...southCharacters].at(parseInt(atob(action.source)) - 1)!;
                const actionType = action.type === 'attack' ? 'Attack' : action.type === 'spell' ? 'Casts' : 'Defends'; 
                let log = `${source.name} ${actionType} ${['spell', 'attack'].includes(action.type) && '-'}`

                if (action.effects) log += ' (';

                for (const effect of action.effects || []) {
                    const target = [...northCharacters, ...southCharacters].at(parseInt(atob(effect.target)) - 1);
                    if (target && effect.amount !== 0) {
                        log += `${target.name} ${effect.amount > 0 ? `-${effect.amount}` : `+${effect.amount}`} `;
                    }
                }

                if (action.effects) log += ')';

                ugl.push(log);
            }
        }
        setGameLog(ugl);
    }, [turns, currentTurn, currentAction, northCharacters, southCharacters]);

    useEffect(() => {
        if (!autoplay || !turns.length) return;

        const intvl = setInterval(() => {
            setCurrentAction((prevAction) => {
                const actionCount = turns[currentTurn]?.actions.length ?? 0;

                if (prevAction < actionCount - 1) {
                    return prevAction + 1;
                }

                if (currentTurn < turns.length - 1) {
                    setCurrentTurn((prevTurn) => prevTurn + 1);
                    return 0;
                }

                setAutoplay(false);
                return prevAction;
            });
        }, ACTION_TIMER);

        return () => clearInterval(intvl);
    }, [autoplay, turns, currentTurn]);

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

            <button disabled={!canGoNext} onClick={() => setAutoplay(!autoplay)}>▶️</button>
            <button disabled={!canGoNext} onClick={goNext}>➡️</button>
            <button disabled={!canGoPrev} onClick={goPrev}>⬅️</button>
            <button onClick={() => { setCurrentTurn(0); setCurrentAction(3); }}>🔄</button>
        </div>
    );
}
