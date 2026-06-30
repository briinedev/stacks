import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import parseGameLog, { Turn } from '../utils/parseGameLog';

import CharacterStatus from './viewer/CharacterStatus';
import CharacterEmulator, { Character, Attack, Spell, CHAR_MAX_HP } from '../utils/characterEmulator';
import { IconArrowNarrowLeft, IconArrowNarrowRight, IconPlayerPause, IconPlayerPlay, IconRefresh } from '@tabler/icons-preact';

type Game = {
    id: string,
    north: string,
    north_characters: Character[],
    north_spellpool: Spell[],
    south: string,
    south_characters: Character[],
    south_spellpool: Spell[],
    status: string,
    nwin: boolean,
    length: number,
    log: string,
    created_at: string,
};

const ACTION_TIMER = 500;

export default function GameViewer({ gameId }: { gameId: string }) {
    const [game, setGame] = useState(undefined as Game | undefined);
    const [turns, setTurns] = useState([] as Turn[]);
    const [gameLog, setGameLog] = useState([] as string[]);
    const [autoplay, setAutoplay] = useState(false);

    const [currentTurn, setCurrentTurn] = useState(0);
    const [currentAction, setCurrentAction] = useState(3);

    const [stack, updateStack] = useState({
        red: 0,
        blue: 0,
        green: 0,
        yellow: 0,
        white: 0,
        black: 0,
        purple: 0,
        orange: 0,
    } as { [key: string]: number });

    const decodeIndex = (token: string) => {
        const parseToken = (text: string) => {
            const parsed = parseInt(text, 10);
            return Number.isNaN(parsed) ? undefined : parsed;
        };

        try {
            return parseToken(atob(token));
        } catch {
            return parseToken(token);
        }
    };

    const shouldIncludeAction = useCallback((turnIndex: number, actionIndex: number) => {
        if (turnIndex < currentTurn) return true;
        if (turnIndex > currentTurn) return false;
        return actionIndex <= currentAction;
    }, [currentTurn, currentAction]);

    const emulateCharacter = useCallback(function(char: Character, side: 'north' | 'south') {
        const charEmu = new CharacterEmulator(char);

        for (let ti = 0; ti < turns.length; ti++) {
            if (ti > currentTurn) break;
            const turn = turns[ti];

            if (turn.active === (side === 'north' ? 'south' : 'north') && ti !== 0) charEmu.regainStamina();
            if (turn.active === side) {
                charEmu.defended = false;
            }

            for (let ai = 0; ai < turn.actions.length; ai++) {
                if (!shouldIncludeAction(ti, ai)) break;
                const action = turn.actions[ai];
                if (action.id === 'defend' && action.source === charEmu.id) charEmu.defended = true;

                if (action.source === charEmu.id && action.type !== 'defend') {
                    charEmu.useStamina(action.type === 'spell' ? 5 : 1);
                }
                if (turn.active !== side && ti !== 0) charEmu.regainStamina();

                for (const effect of action.effects || []) {
                    if (effect.target === charEmu.id) charEmu.hp -= effect.amount;
                }
            }
        }

        return charEmu;
    }, [currentTurn, shouldIncludeAction, turns]);

    const [selChar, setSelChar] = useState(game ? emulateCharacter(game?.north_characters[0], 'north') : undefined);

    const northCharacters = useMemo(() => {
        return (game?.north_characters || []).map(char => emulateCharacter(char, 'north'));
    }, [game, emulateCharacter]);

    const southCharacters = useMemo(() => {
        return (game?.south_characters || []).map(char => emulateCharacter(char, 'south'));
    }, [game, emulateCharacter]);

    useEffect(() => {
        if (game) setSelChar(emulateCharacter(game?.north_characters[0], 'north'));
    }, [game, emulateCharacter]);

    useEffect(() => {
        const newStack = {
            red: 0,
            blue: 0,
            green: 0,
            yellow: 0,
            white: 0,
            black: 0,
            purple: 0,
            orange: 0,
        } as { [key: string]: number };

        for (let ti = 0; ti < turns.length; ti++) {
            if (ti > currentTurn) break;
            const turn = turns[ti];

            for (let ai = 0; ai < turn.actions.length; ai++) {
                if (!shouldIncludeAction(ti, ai)) break;
                const action = turn.actions[ai];

                if (action.type === 'attack') {
                    const ref = [...northCharacters, ...southCharacters].at(decodeIndex(action.source)! - 1)?.attacks.find(a => a.id === action.id);
                    if (!ref) console.error(`Cannot find attack ${action.id} on character ${action.source}`);
                    else {
                        const isController = 'controller' === [...northCharacters, ...southCharacters].at(decodeIndex(action.source)! - 1)?.class;
                        newStack[ref.element.id] += isController ? 2 : 1;
                    }
                } else if (action.type === 'spell') {
                    const ref = [
                        ...[...northCharacters, ...southCharacters].at(decodeIndex(action.source)! - 1)?.spells || [],
                        ...game?.north_spellpool || [],
                        ...game?.south_spellpool || []
                    ].find(s => s.id === action.id);
                    if (!ref) console.error(`Cannot find spell ${action.id} on character ${action.source}`);
                    else {
                        const isCaster = 'caster' === [...northCharacters, ...southCharacters].at(decodeIndex(action.source)! - 1)?.class;
                        newStack[ref.element.id] -= ref.stackCost - (isCaster ? 1 : 0);
                    }
                }
            }
        }

        updateStack(newStack);
    }, [currentTurn, shouldIncludeAction, turns, northCharacters, southCharacters, game?.north_spellpool, game?.south_spellpool]);

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

    const getCharacterByToken = useCallback((token: string) => {
        const index = decodeIndex(token);
        if (index === undefined) return undefined;
        return [...northCharacters, ...southCharacters].at(index - 1);
    }, [northCharacters, southCharacters]);

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
        if (!turns.length) return;

        const attacks = [] as Attack[];
        const spells = [] as Spell[];
        for (const char of [...northCharacters, ...southCharacters]) {
            for (const spell of char.spells) {
                spells.push(spell);
            }
            for (const attack of char.attacks) {
                attacks.push(attack);
            }
        }
        for (const spell of [...game?.north_spellpool || [], ...game?.south_spellpool || []]) {
            spells.push(spell);
        }

        function getActionName(id: string) {
            const foundAttack = attacks.find(a => a.id === id);
            const foundSpell = spells.find(s => s.id === id);

            if (foundAttack) return foundAttack.name;
            if (foundSpell) return foundSpell.name;
            return 'Unknown';
        }

        const ugl = ['Game Start!'];
        for (let i = 0; i < turns.length; i++) {
            if (i > currentTurn) break;
            const turn = turns[i];
            ugl.push(`Turn start: ${game![turn.active]}`);

            for (let ai = 0; ai < turn.actions.length; ai++) {
                if (i === currentTurn && ai > currentAction) break;
                const action = turn.actions[ai];
                const source = getCharacterByToken(action.source);
                const actionType = action.type === 'attack' ? 'Attacks with' : action.type === 'spell' ? 'Casts' : 'Defends';
                let log = `${source?.name ?? 'Unknown'} ${actionType}${['spell', 'attack'].includes(action.type) ? ` ${getActionName(action.id)}` : ''}`;

                if (action.effects) log += ' (';

                for (let ei = 0; ei < (action.effects?.length ?? 0); ei++) {
                    const effect = action.effects![ei];
                    const target = getCharacterByToken(effect.target);
                    if (target) {
                        log += `${target.name} ${effect.amount >= 0 ? `-${effect.amount}` : `+${Math.abs(effect.amount)}`}`;
                        if (ei < action.effects!.length - 1) log += ' ';
                    }
                }

                if (action.effects) log += ')';

                ugl.push(log);

                setSelChar(source);
            }

            if (turn.wins && currentAction >= turn.actions.length - 1) ugl.push(`${game![turn.active]} wins!`);
        }
        setGameLog(ugl);
    }, [game, turns, currentTurn, currentAction, northCharacters, southCharacters, getCharacterByToken]);

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
        <div className="w-full">
            <span class={turns[currentTurn].active === 'north' ? 'text-green-600 font-bold' : 'text-gray-600'}>HotGuy24</span>
            <div class="flex w-full">
                { northCharacters.map(char => <CharacterStatus char={char} onClick={() => setSelChar(char)} />) }
            </div>

            <div class="flex">
                <div class="border-r pr-4 w-1/2">
                    <div class="flex flex-col-reverse h-78 overflow-scroll text-nowrap mt-4 scrollbar-none">
                        {gameLog.toReversed().map(t => (<p>{t}</p>))}
                    </div>
                </div>
                <div class="p-4 border-r font-bold text-center">
                    <div class="h-44 grid grid-cols-2 grid-rows-4">
                        <div class="bg-red-500 p-1 m-1 w-8 h-8 rounded-full">{stack.red}</div>
                        <div class="bg-blue-500 p-1 m-1 w-8 h-8 rounded-full">{stack.blue}</div>
                        <div class="bg-green-500 p-1 m-1 w-8 h-8 rounded-full">{stack.green}</div>
                        <div class="bg-yellow-500 p-1 m-1 w-8 h-8 rounded-full">{stack.yellow}</div>
                        <div class="bg-white text-black p-1 m-1 w-8 h-8 rounded-full">{stack.white}</div>
                        <div class="bg-black p-1 m-1 w-8 h-8 rounded-full">{stack.black}</div>
                        <div class="bg-purple-500 p-1 m-1 w-8 h-8 rounded-full">{stack.purple}</div>
                        <div class="bg-orange-500 p-1 m-1 w-8 h-8 rounded-full">{stack.orange}</div>
                    </div>
                </div>
                <div class="p-4 h-78 overflow-scroll scrollbar-none">
                    <div class="font-bold">{selChar?.name}</div>
                    <br />
                    <div>STA: {selChar?.stamina} / {selChar?.maxStamina}</div>
                    <div>HP: {selChar?.hp} / {CHAR_MAX_HP}</div>
                    <br />
                    <div>Class: {selChar?.class?.toUpperCase()}</div>
                    <div>Primary: {selChar?.primary?.toUpperCase()}</div>
                    <div>Secondary: {selChar?.secondary?.toUpperCase()}</div>
                    <br />
                    <div>
                        <div>Effects</div>
                        None
                    </div>
                    <br />
                    <div>
                        <div class="font-bold">Cooldowns</div>
                        {
                            [...selChar?.spells || [], ...game.north_spellpool].map(s => {
                                return (
                                    <div>
                                        {s.name}: Ready
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>

            <span class={turns[currentTurn].active === 'south' ? 'text-green-600 font-bold' : 'text-gray-600'}>WeeWoo1337</span>
            <div class="flex w-full">
                { southCharacters.map(char => <CharacterStatus char={char} onClick={() => setSelChar(char)} />) }
            </div>

            <button disabled={!canGoNext} onClick={() => setAutoplay(!autoplay)}>
                { autoplay ? <IconPlayerPause /> : <IconPlayerPlay /> }
            </button>
            <button disabled={!canGoNext} onClick={goNext}>
                <IconArrowNarrowRight />
            </button>
            <button disabled={!canGoPrev} onClick={goPrev}>
                <IconArrowNarrowLeft />
            </button>
            <button onClick={() => { setCurrentTurn(0); setCurrentAction(3); }}>
                <IconRefresh />
            </button>

            <select onChange={e => setCurrentTurn(parseInt(e.currentTarget.value))} value={currentTurn}>
                {Array.from({ length: turns.length }).map((_,i) => {
                    if (i === 0) return <option value={0}>Game Start</option>;
                    else return <option value={i}>Turn {i}</option>
                })}
            </select>
        </div>
    );
}
