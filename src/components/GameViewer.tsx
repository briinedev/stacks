import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import parseGameLog, { Turn } from '../utils/parseGameLog';

import CharacterStatus from './viewer/CharacterStatus';
import CharacterEmulator, { Character, Attack, Spell, CHAR_MAX_HP } from '../utils/characterEmulator';
import { IconArrowNarrowLeft, IconArrowNarrowRight, IconPlayerPause, IconPlayerPlay, IconPlayerSkipForward, IconRefresh, IconShield, IconSword, IconWand } from '@tabler/icons-preact';
import { ClassIcon, ElementIcon, getElementMeta } from './shared/CombatPresentation';

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

type AgentVersion = {
    success?: boolean;
    agent: {
        id: string;
        user_id: string;
        name: string;
    },
    version: {
        id: string;
        agent_id: string;
        version: string;
        label?: string | null;
        elo?: number;
    }
}

type ReplayResponse = {
    success: boolean;
    game: Game;
};

type UserResponse = {
    success: boolean;
    user?: User;
};

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    return await response.json() as T;
}

const FAST_ACTION_TIMER = 160;
const SPELL_ACTION_TIMER = 1000;
const SKIP_TO_SPELL_TIMER = 50;

export default function GameViewer({ matchId }: { matchId: string }) {
    const [game, setGame] = useState(undefined as Game | undefined);
    const [turns, setTurns] = useState([] as Turn[]);
    const [gameLog, setGameLog] = useState([] as ComponentChildren[]);
    const [autoplay, setAutoplay] = useState(false);
    const [skipToSpell, setSkipToSpell] = useState(false);

    const [currentTurn, setCurrentTurn] = useState(0);
    const [currentAction, setCurrentAction] = useState(3);

    const [northPlayer, setNorthPlayer] = useState(undefined as User | undefined);
    const [southPlayer, setSouthPlayer] = useState(undefined as User | undefined);
    const [northAgent, setNorthAgent] = useState(undefined as AgentVersion | undefined);
    const [southAgent, setSouthAgent] = useState(undefined as AgentVersion | undefined);

    const [stack, updateStack] = useState({
        red: 0,
        blue: 0,
        green: 0,
        yellow: 0,
        light: 0,
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

    const getActionStaminaCost = useCallback((char: Character, side: 'north' | 'south', actionId: string, actionType: 'spell' | 'attack' | 'defend') => {
        if (actionType === 'defend') return 0;

        if (actionType === 'attack') {
            return char.attacks.find(attack => attack.id === actionId)?.stamina ?? 1;
        }

        const sideSpellPool = side === 'north' ? (game?.north_spellpool || []) : (game?.south_spellpool || []);
        return [...char.spells, ...sideSpellPool].find(spell => spell.id === actionId)?.stamina ?? 8;
    }, [game]);

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
                    charEmu.useStamina(getActionStaminaCost(char, side, action.id, action.type));
                }
                if (turn.active !== side && ti !== 0 && action.type !== 'defend') charEmu.regainStamina();

                for (const effect of action.effects || []) {
                    if (effect.kind === 'hp' && effect.target === charEmu.id && typeof effect.amount === 'number') {
                        charEmu.hp -= effect.amount;
                    }
                }
            }
        }

        return charEmu;
    }, [currentTurn, getActionStaminaCost, shouldIncludeAction, turns]);

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
            light: 0,
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

                for (const effect of action.effects || []) {
                    if (effect.kind === 'stack' && effect.element && typeof effect.amount === 'number' && effect.op) {
                        const delta = effect.op === 'g' ? effect.amount : -effect.amount;
                        newStack[effect.element] = Math.max(0, (newStack[effect.element] ?? 0) + delta);
                    }
                }
            }
        }

        updateStack(newStack);
    }, [currentTurn, shouldIncludeAction, turns]);

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
        const run = async () => {
            try {
                const data = await fetchJson<ReplayResponse>(import.meta.env.VITE_API_HOST + '/game/' + matchId);
                if (!data?.game) return;

                setGame(data.game);
                setTurns(parseGameLog(data.game.log, data.game.south_characters));
                setCurrentTurn(0);
                setCurrentAction(3);
                setAutoplay(false);
                setSkipToSpell(false);
            } catch (error) {
                console.error(error);
            }
        };

        run();
    }, [matchId]);

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

        function getActionElement(actionId: string, actionType: 'attack' | 'spell' | 'defend') {
            if (actionType === 'attack') {
                return attacks.find((attack) => attack.id === actionId)?.element?.id;
            }

            if (actionType === 'spell') {
                return spells.find((spell) => spell.id === actionId)?.element?.id;
            }

            return undefined;
        }

        function getElementColorClass(element?: string) {
            switch (element?.toLowerCase()) {
                case 'red':
                    return 'text-red-500';
                case 'blue':
                    return 'text-sky-400';
                case 'green':
                    return 'text-emerald-400';
                case 'yellow':
                    return 'text-amber-300';
                case 'light':
                    return 'text-slate-100';
                case 'dark':
                case 'black':
                    return 'text-slate-500';
                case 'purple':
                    return 'text-fuchsia-400';
                case 'orange':
                    return 'text-orange-400';
                default:
                    return 'text-slate-300';
            }
        }

        function joinNodes(nodes: ComponentChildren[]) {
            const joined = [] as ComponentChildren[];
            for (let index = 0; index < nodes.length; index++) {
                if (index > 0) joined.push(' ');
                joined.push(nodes[index]);
            }
            return joined;
        }

        function renderEffectSummary(effect: NonNullable<Turn['actions'][number]['effects']>[number], key: string) {
            if (effect.kind === 'hp' && effect.target && typeof effect.amount === 'number') {
                const target = getCharacterByToken(effect.target);
                if (!target) return null;

                return <span key={key}>{target.name} {effect.amount >= 0 ? `-${effect.amount}` : `+${Math.abs(effect.amount)}`}</span>;
            }

            if (effect.kind === 'stack' && effect.element && typeof effect.amount === 'number' && effect.op) {
                return (
                    <span key={key} class="inline-flex items-center gap-1">
                        <ElementIcon element={effect.element} size={14} />
                        <span>{`${effect.op === 'g' ? '+' : '-'}${effect.amount}`}</span>
                    </span>
                );
            }

            if (effect.kind === 'effect' && effect.op && effect.target && effect.effectId) {
                const target = getCharacterByToken(effect.target);
                const lifecycleIcon = effect.op === 'g' ? '✨' : '⌛';
                return <span key={key}>{lifecycleIcon}{target?.name ?? 'Unknown'} {effect.effectId}</span>;
            }

            return null;
        }

        const ugl = ['Game Start!'] as ComponentChildren[];
        for (let i = 0; i < turns.length; i++) {
            if (i > currentTurn) break;
            const turn = turns[i];
            const activeBotName = turn.active === 'north'
                ? (northAgent?.agent?.name ?? northPlayer?.username ?? 'North')
                : (southAgent?.agent?.name ?? southPlayer?.username ?? 'South');
            ugl.push(`Turn start: ${activeBotName}`);

            for (let ai = 0; ai < turn.actions.length; ai++) {
                if (i === currentTurn && ai > currentAction) break;
                const action = turn.actions[ai];
                const source = getCharacterByToken(action.source);
                const actionElement = getActionElement(action.id, action.type);
                const actionColorClass = getElementColorClass(actionElement);
                if (action.id === 'system') {
                    const systemEffects = (action.effects || [])
                        .map((effect, index) => renderEffectSummary(effect, `system-${i}-${ai}-${index}`))
                        .filter((node) => node !== null);

                    ugl.push(
                        <span>
                            <span>System</span>
                            {systemEffects.length ? <span>{' ('}{joinNodes(systemEffects)}{')'}</span> : null}
                        </span>
                    );
                    continue;
                }

                const effectNodes = (action.effects || [])
                    .map((effect, index) => renderEffectSummary(effect, `effect-${i}-${ai}-${index}`))
                    .filter((node) => node !== null);

                ugl.push(
                    <span>
                        <span class="mr-1">{source?.name ?? 'Unknown'}</span>
                        {action.type === 'attack' ? <IconSword size={16} class={`inline align-text-bottom ${actionColorClass}`} /> : null}
                        {action.type === 'spell' ? <IconWand size={16} class={`inline align-text-bottom ${actionColorClass}`} /> : null}
                        {action.type === 'defend' ? <IconShield size={16} class="inline align-text-bottom text-emerald-300" /> : null}
                        {['spell', 'attack'].includes(action.type) ? <span>{` ${getActionName(action.id)}`}</span> : null}
                        {effectNodes.length ? <span>{' ('}{joinNodes(effectNodes)}{')'}</span> : null}
                    </span>
                );

                setSelChar(source);
            }

            if (turn.wins && currentAction >= turn.actions.length - 1) ugl.push(`${turn.active === 'north' ? northPlayer?.username ?? 'North' : southPlayer?.username ?? 'South'} wins!`);
        }
        setGameLog(ugl);
    }, [game, turns, currentTurn, currentAction, northCharacters, southCharacters, getCharacterByToken, northPlayer, southPlayer, northAgent, southAgent]);

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
        const run = async () => {
            try {
                const [northUser, northVersion, southUser, southVersion] = await Promise.all([
                    fetchJson<UserResponse>(import.meta.env.VITE_API_HOST + '/user/' + game.north.split(':')[0]),
                    fetchJson<AgentVersion>(import.meta.env.VITE_API_HOST + '/agentVersions/' + game.north.split(':')[1]),
                    fetchJson<UserResponse>(import.meta.env.VITE_API_HOST + '/user/' + game.south.split(':')[0]),
                    fetchJson<AgentVersion>(import.meta.env.VITE_API_HOST + '/agentVersions/' + game.south.split(':')[1]),
                ]);

                setNorthPlayer(northUser.user);
                setNorthAgent(northVersion);
                setSouthPlayer(southUser.user);
                setSouthAgent(southVersion);
            } catch (error) {
                console.error(error);
            }
        };

        run();
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

    if (!game || turns.length === 0) return null;

    const activeSide = turns[currentTurn]?.active;

    return (
        <div class="w-full rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-5 shadow-2xl shadow-cyan-950/30">
            <div class={activeSide === 'north' ? 'mb-2 rounded-xl border border-emerald-500/40 bg-emerald-900/30 px-3 py-2 text-emerald-200 font-semibold text-sm sm:text-base' : 'mb-2 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-300 text-sm sm:text-base'}>
                {northAgent?.agent?.name} {northAgent?.version?.label ?? northAgent?.version?.version} ({northPlayer?.username ?? 'North'})
            </div>

            <div class="grid w-full grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-1 sm:gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-2 sm:p-3">
                { northCharacters.map(char => <CharacterStatus char={char} onClick={() => setSelChar(char)} />) }
            </div>

            <div class="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-3 sm:p-4 lg:col-span-6">
                    <strong class="block text-slate-100 tracking-wide">Action Log</strong>
                    <div class="mt-3 flex flex-col-reverse h-56 sm:h-72 lg:h-[28rem] overflow-auto scrollbar-none break-words whitespace-normal rounded-lg border border-slate-800 bg-slate-950/70 p-2 sm:p-3 text-sm sm:text-base text-left">
                        {gameLog.toReversed().map((t, i) => (<p key={i} class="py-0.5">{t}</p>))}
                    </div>
                </div>

                <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-3 sm:p-4 lg:col-span-2">
                    <strong class="block mb-3 text-center text-slate-100 tracking-wide">Stack</strong>
                    <div class="space-y-1.5 text-xs sm:text-sm">
                        {(['red', 'blue', 'green', 'yellow', 'light', 'black', 'purple', 'orange'] as const).map((element) => {
                            const meta = getElementMeta(element);

                            return (
                                <div key={element} class="flex items-center justify-between rounded-md border border-slate-700/80 bg-slate-950/70 px-2 py-1">
                                    <span class="inline-flex items-center gap-1.5" title={meta.label}>
                                        <ElementIcon element={element} size={14} />
                                        <span>{meta.short}</span>
                                    </span>
                                    <span class="font-semibold">{stack[element]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div class="rounded-xl border border-slate-700 bg-slate-900/70 p-3 sm:p-4 overflow-auto scrollbar-none lg:col-span-4 text-left flex flex-col">
                    <strong class="block text-slate-100 tracking-wide">Character Info</strong>
                    <div class="mt-2 text-lg font-bold text-slate-100">
                        <ClassIcon classType={selChar?.class ?? ''} size={18} />
                        <span class="ml-1">{selChar?.name}</span>
                    </div>
                    <div class="mt-2 text-sm sm:text-base text-slate-300">STA: {selChar?.stamina} / {selChar?.maxStamina}</div>
                    <div class="text-sm sm:text-base text-slate-300">HP: {selChar?.hp} / {CHAR_MAX_HP}</div>

                    <div class="mt-3 space-y-1 text-sm sm:text-base">
                        <div class="text-slate-300">Class: <span class="text-slate-100 font-semibold">{selChar?.class?.toUpperCase()}</span></div>
                        <div class="text-slate-300">Primary: <span class="text-slate-100 font-semibold">{selChar?.primary?.toUpperCase()}</span></div>
                        <div class="text-slate-300">Secondary: <span class="text-slate-100 font-semibold">{selChar?.secondary?.toUpperCase()}</span></div>
                    </div>

                    <div class="mt-3">
                        <div class="text-slate-300">Effects</div>
                        <div class="text-slate-500 text-sm">None</div>
                    </div>

                    <div class="mt-3">
                        <div class="text-slate-300">Passives</div>
                        {selChar?.passives?.length ? (
                            <div class="mt-1 flex flex-wrap gap-1.5">
                                {selChar.passives.map((passive) => (
                                    <span
                                        key={passive.name}
                                        title={passive.description || passive.name}
                                        class="px-2 py-0.5 rounded bg-cyan-900/40 text-cyan-200 text-xs"
                                    >
                                        {passive.name}
                                    </span>
                                ))}
                            </div>
                        ) : <div class="text-slate-500 text-sm">None</div>}
                    </div>

                    <div class="mt-4">
                        <div class="font-bold text-slate-100">Spells</div>
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

            <div class="mt-3 grid w-full grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-1 sm:gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-2 sm:p-3">
                { southCharacters.map(char => <CharacterStatus char={char} onClick={() => setSelChar(char)} />) }
            </div>
            <div class={activeSide === 'south' ? 'mt-2 rounded-xl border border-emerald-500/40 bg-emerald-900/30 px-3 py-2 text-emerald-200 font-semibold text-sm sm:text-base' : 'mt-2 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-slate-300 text-sm sm:text-base'}>
                {southAgent?.agent?.name} {southAgent?.version?.label ?? southAgent?.version?.version} ({southPlayer?.username ?? 'South'})
            </div>

            <div class="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 items-center rounded-xl border border-slate-700 bg-slate-900/70 p-2 sm:p-3">
                <button class="h-10 sm:h-11 px-3 py-2 border border-slate-600 rounded bg-slate-800/90 disabled:opacity-50" disabled={!canGoNext} onClick={() => { setSkipToSpell(false); setAutoplay(!autoplay); }}>
                    { autoplay ? <IconPlayerPause /> : <IconPlayerPlay /> }
                </button>
                <button class="h-10 sm:h-11 px-3 py-2 border border-slate-600 rounded bg-slate-800/90 disabled:opacity-50" disabled={!canGoNext} onClick={() => { setAutoplay(false); setSkipToSpell(true); }}>
                    <IconPlayerSkipForward />
                </button>
                <button class="h-10 sm:h-11 px-3 py-2 border border-slate-600 rounded bg-slate-800/90 disabled:opacity-50" disabled={!canGoNext} onClick={goNext}>
                    <IconArrowNarrowRight />
                </button>
                <button class="h-10 sm:h-11 px-3 py-2 border border-slate-600 rounded bg-slate-800/90 disabled:opacity-50" disabled={!canGoPrev} onClick={goPrev}>
                    <IconArrowNarrowLeft />
                </button>
                <button class="h-10 sm:h-11 px-3 py-2 border border-slate-600 rounded bg-slate-800/90" onClick={() => { setCurrentTurn(0); setCurrentAction(3); setAutoplay(false); setSkipToSpell(false); }}>
                    <IconRefresh />
                </button>

                <select class="col-span-2 sm:col-span-5 w-full px-3 py-2 border border-slate-600 rounded bg-slate-800/90 text-sm sm:text-base" onChange={e => { setSkipToSpell(false); setCurrentTurn(parseInt(e.currentTarget.value)); }} value={currentTurn}>
                    {Array.from({ length: turns.length }).map((_,i) => {
                        if (i === 0) return <option value={0}>Game Start</option>;
                        else return <option value={i}>Turn {i}</option>
                    })}
                </select>
            </div>
        </div>
    );
}
