import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import parseGameLog, { Turn } from '../utils/parseGameLog';

import CharacterStatus from './viewer/CharacterStatus';
import CharacterEmulator, { Character, Attack, Spell, CHAR_MAX_HP } from '../utils/characterEmulator';
import { IconArrowNarrowLeft, IconArrowNarrowRight, IconPlayerPause, IconPlayerPlay, IconPlayerSkipForward, IconRefresh } from '@tabler/icons-preact';

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

type User = {
    id: string,
    username: string,
    avatar_url?: string,
};

type CooldownAbility = {
    id: string;
    name: string;
    baseCooldown: number;
};

type CooldownEntry = CooldownAbility & {
    remaining: number;
};

const FAST_ACTION_TIMER = 160;
const SPELL_ACTION_TIMER = 1250;
const SKIP_TO_SPELL_TIMER = 50;

export default function GameViewer({ gameId }: { gameId: string }) {
    const [game, setGame] = useState(undefined as Game | undefined);
    const [turns, setTurns] = useState([] as Turn[]);
    const [gameLog, setGameLog] = useState([] as string[]);
    const [autoplay, setAutoplay] = useState(false);
    const [skipToSpell, setSkipToSpell] = useState(false);

    const [currentTurn, setCurrentTurn] = useState(0);
    const [currentAction, setCurrentAction] = useState(3);

    const [northPlayer, setNorthPlayer] = useState(undefined as User | undefined);
    const [southPlayer, setSouthPlayer] = useState(undefined as User | undefined);

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
                    charEmu.useStamina(action.type === 'spell' ? 8 : 1);
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

    const getNextStep = useCallback((turnIndex: number, actionIndex: number) => {
        const actionCount = turns[turnIndex]?.actions.length ?? 0;

        if (actionIndex < actionCount - 1) {
            const nextActionIndex = actionIndex + 1;
            return {
                turnIndex,
                actionIndex: nextActionIndex,
                action: turns[turnIndex]?.actions[nextActionIndex],
            };
        }

        if (turnIndex < turns.length - 1) {
            return {
                turnIndex: turnIndex + 1,
                actionIndex: 0,
                action: turns[turnIndex + 1]?.actions[0],
            };
        }

        return null;
    }, [turns]);

    const goNext = () => {
        setSkipToSpell(false);
        const nextStep = getNextStep(currentTurn, currentAction);
        if (!nextStep) return;

        setCurrentTurn(nextStep.turnIndex);
        setCurrentAction(nextStep.actionIndex);
    };

    const goPrev = () => {
        setSkipToSpell(false);
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
                setSkipToSpell(false);
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
            ugl.push(`Turn start: ${turn.active === 'north' ? northPlayer?.username ?? 'North' : southPlayer?.username ?? 'South'}`);

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

            if (turn.wins && currentAction >= turn.actions.length - 1) ugl.push(`${turn.active === 'north' ? northPlayer?.username ?? 'North' : southPlayer?.username ?? 'South'} wins!`);
        }
        setGameLog(ugl);
    }, [game, turns, currentTurn, currentAction, northCharacters, southCharacters, getCharacterByToken, northPlayer, southPlayer]);

    useEffect(() => {
        if (!autoplay || skipToSpell || !turns.length) return;

        const nextStep = getNextStep(currentTurn, currentAction);
        if (!nextStep) {
            setAutoplay(false);
            return;
        }

        const currentStepAction = turns[currentTurn]?.actions[currentAction];
        const delay = currentStepAction?.type === 'spell' ? SPELL_ACTION_TIMER : FAST_ACTION_TIMER;
        const timeoutId = setTimeout(() => {
            setCurrentTurn(nextStep.turnIndex);
            setCurrentAction(nextStep.actionIndex);
        }, delay);

        return () => clearTimeout(timeoutId);
    }, [autoplay, skipToSpell, turns, currentTurn, currentAction, getNextStep]);

    useEffect(() => {
        if (!skipToSpell || !turns.length) return;

        const nextStep = getNextStep(currentTurn, currentAction);
        if (!nextStep) {
            setSkipToSpell(false);
            setAutoplay(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            setCurrentTurn(nextStep.turnIndex);
            setCurrentAction(nextStep.actionIndex);

            if (nextStep.action?.type === 'spell') {
                setSkipToSpell(false);
                setAutoplay(false);
            }
        }, SKIP_TO_SPELL_TIMER);

        return () => clearTimeout(timeoutId);
    }, [skipToSpell, turns, currentTurn, currentAction, getNextStep]);

    useEffect(() => {
        if (!game) return;
        fetch(import.meta.env.VITE_API_HOST + '/user/' + game.north)
            .then(res => res.json())
            .then(data => setNorthPlayer(data.user))
            .catch(console.error);

        fetch(import.meta.env.VITE_API_HOST + '/user/' + game.south)
            .then(res => res.json())
            .then(data => setSouthPlayer(data.user))
            .catch(console.error);
    }, [game]);

    const selectedCharCooldowns = useMemo(() => {
        if (!game || !selChar) return [] as CooldownEntry[];

        const selectedIsNorth = game.north_characters.some(c => c.id === selChar.id);
        const selectedIsSouth = game.south_characters.some(c => c.id === selChar.id);
        if (!selectedIsNorth && !selectedIsSouth) return [] as CooldownEntry[];

        const selectedSide = selectedIsNorth ? 'north' : 'south';
        const sideSpellPool = selectedSide === 'north' ? game.north_spellpool : game.south_spellpool;

        const parseCooldown = (ability: unknown) => {
            const cooldownValue = (ability as { currentCooldown?: number; cooldown?: number }).cooldown;
            const currentValue = (ability as { currentCooldown?: number; cooldown?: number }).currentCooldown;
            const value = cooldownValue ?? currentValue ?? 0;

            return Math.max(0, value);
        };

        const abilities = [
            ...selChar.spells.map(s => ({
                id: s.id,
                name: s.name,
                baseCooldown: parseCooldown(s),
            })),
            ...sideSpellPool.map(s => ({
                id: s.id,
                name: s.name,
                baseCooldown: parseCooldown(s),
            })),
        ] as CooldownAbility[];

        const uniqueAbilities = Array.from(new Map(abilities.map(a => [a.id, a])).values());
        const remainingById = new Map(uniqueAbilities.map(a => [a.id, 0]));
        const selectedSideCharacterIds = new Set(
            (selectedSide === 'north' ? game.north_characters : game.south_characters).map(c => c.id)
        );

        for (let ti = 0; ti < turns.length; ti++) {
            if (ti > currentTurn) break;
            const turn = turns[ti];

            // Cooldowns tick down at the start of this character's side turn.
            if (turn.active === selectedSide && ti !== 0) {
                for (const [abilityId, remaining] of remainingById.entries()) {
                    if (remaining > 0) remainingById.set(abilityId, remaining - 1);
                }
            }

            for (let ai = 0; ai < turn.actions.length; ai++) {
                if (!shouldIncludeAction(ti, ai)) break;
                const action = turn.actions[ai];

                const ability = uniqueAbilities.find(a => a.id === action.id);
                if (!ability || ability.baseCooldown < 1) continue;

                const sourceIsSelectedSide = selectedSideCharacterIds.has(action.source);

                if (sourceIsSelectedSide) {
                    remainingById.set(ability.id, ability.baseCooldown);
                }
            }
        }

        return uniqueAbilities.map(ability => ({
            ...ability,
            remaining: remainingById.get(ability.id) ?? 0,
        })).sort((a, b) => {
            const aCooling = a.remaining > 0 ? 1 : 0;
            const bCooling = b.remaining > 0 ? 1 : 0;
            if (aCooling !== bCooling) return bCooling - aCooling;
            if (a.remaining !== b.remaining) return b.remaining - a.remaining;
            return a.name.localeCompare(b.name);
        });
    }, [game, selChar, turns, currentTurn, shouldIncludeAction]);

    const coolingSpells = selectedCharCooldowns.filter(spell => spell.remaining > 0);
    const readySpells = selectedCharCooldowns.filter(spell => spell.remaining <= 0);

    if (!game || !gameLog || !turns) return;

    return (
        <div className="w-full bg-gray-900 p-2 sm:p-4 border">
            <div class={turns[currentTurn].active === 'north' ? 'text-green-600 font-bold' : 'text-gray-600'}>{northPlayer?.username ?? 'North'}</div>
            <div class="flex w-full flex-wrap">
                { northCharacters.map(char => <CharacterStatus char={char} onClick={() => setSelChar(char)} />) }
            </div>

            <div class="flex flex-col lg:flex-row border">
                <div class="px-3 py-3 sm:px-4 lg:w-1/2 lg:border-r border-b lg:border-b-0">
                    <strong class="pt-4 block">Action Log</strong>
                    <div class="flex flex-col-reverse h-56 sm:h-72 lg:h-78 overflow-auto mt-4 scrollbar-none break-words whitespace-normal">
                        {gameLog.toReversed().map(t => (<p>{t}</p>))}
                    </div>
                </div>
                <div class="p-3 sm:p-4 font-bold text-center border-b lg:border-b-0 lg:border-r">
                    <strong class="block mb-4">Stack</strong>
                    <div class="h-auto sm:h-44 grid grid-cols-4 sm:grid-cols-2 grid-rows-2 sm:grid-rows-4 gap-2 sm:gap-0 place-items-center">
                        <div class="bg-red-500 p-1 w-8 h-8 rounded-full">{stack.red}</div>
                        <div class="bg-blue-500 p-1 w-8 h-8 rounded-full">{stack.blue}</div>
                        <div class="bg-green-500 p-1 w-8 h-8 rounded-full">{stack.green}</div>
                        <div class="bg-yellow-500 p-1 w-8 h-8 rounded-full">{stack.yellow}</div>
                        <div class="bg-white text-black p-1 w-8 h-8 rounded-full">{stack.white}</div>
                        <div class="bg-black p-1 w-8 h-8 rounded-full">{stack.black}</div>
                        <div class="bg-purple-500 p-1 w-8 h-8 rounded-full">{stack.purple}</div>
                        <div class="bg-orange-500 p-1 w-8 h-8 rounded-full">{stack.orange}</div>
                    </div>
                </div>
                <div class="p-3 sm:p-4 max-h-80 lg:max-h-none overflow-auto scrollbar-none">
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
                        <div class="font-bold">Spells</div>
                        <div class="mt-2">
                            <div class="text-gray-300 text-sm uppercase tracking-wide">Cooling ({coolingSpells.length})</div>
                            {coolingSpells.length === 0 && <div class="text-gray-400">None</div>}
                            {coolingSpells.map(s => (
                                <div key={s.id} class="flex items-center justify-between gap-3">
                                    <span class="truncate">{s.name}</span>
                                    <span class="text-amber-300 font-semibold">{s.remaining}t</span>
                                </div>
                            ))}
                        </div>
                        <div class="mt-3">
                            <div class="text-gray-300 text-sm uppercase tracking-wide">Ready ({readySpells.length})</div>
                            {readySpells.length === 0 && <div class="text-gray-400">None</div>}
                            <div class="mt-1 flex flex-wrap gap-1.5">
                                {readySpells.map(s => (
                                    <span key={s.id} class="px-2 py-0.5 rounded bg-emerald-900/40 text-emerald-200 text-xs">
                                        {s.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex w-full flex-wrap">
                { southCharacters.map(char => <CharacterStatus char={char} onClick={() => setSelChar(char)} />) }
            </div>
            <div class={turns[currentTurn].active === 'south' ? 'text-green-600 font-bold' : 'text-gray-600'}>{southPlayer?.username ?? 'South'}</div>

            <div class="mt-4 flex flex-wrap items-center gap-2">
                <button class="px-3 py-2 border rounded bg-gray-800" disabled={!canGoNext} onClick={() => { setSkipToSpell(false); setAutoplay(!autoplay); }}>
                    { autoplay ? <IconPlayerPause /> : <IconPlayerPlay /> }
                </button>
                <button class="px-3 py-2 border rounded bg-gray-800" disabled={!canGoNext} onClick={() => { setAutoplay(false); setSkipToSpell(true); }}>
                    <IconPlayerSkipForward />
                </button>
                <button class="px-3 py-2 border rounded bg-gray-800" disabled={!canGoNext} onClick={goNext}>
                    <IconArrowNarrowRight />
                </button>
                <button class="px-3 py-2 border rounded bg-gray-800" disabled={!canGoPrev} onClick={goPrev}>
                    <IconArrowNarrowLeft />
                </button>
                <button class="px-3 py-2 border rounded bg-gray-800" onClick={() => { setCurrentTurn(0); setCurrentAction(3); setAutoplay(false); setSkipToSpell(false); }}>
                    <IconRefresh />
                </button>

                <select class="ml-auto w-full sm:w-auto px-2 py-2 border rounded bg-gray-800" onChange={e => { setSkipToSpell(false); setCurrentTurn(parseInt(e.currentTarget.value)); }} value={currentTurn}>
                    {Array.from({ length: turns.length }).map((_,i) => {
                        if (i === 0) return <option value={0}>Game Start</option>;
                        else return <option value={i}>Turn {i}</option>
                    })}
                </select>
            </div>
        </div>
    );
}
