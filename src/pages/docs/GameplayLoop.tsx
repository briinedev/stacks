import DocsPageLayout from '../../components/docs/DocsPageLayout';

export default function GameplayLoop() {
    return (
        <DocsPageLayout
            title="Implement The Gameplay Loop"
            summary="Handle queue and in-game prompts in order so your agent can finish full matches without manual intervention."
        >
            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Prompt Order You Must Handle</h2>
                <ol class="mt-3 list-decimal pl-5 space-y-2 text-slate-200">
                    <li><code>onQueuePop</code> → call <code>joinGame(matchId)</code></li>
                    <li><code>onCharacterPrompt</code> → call <code>pickCharacter(matchId, characterId)</code></li>
                    <li><code>onSpellsPrompt</code> → call <code>setSpellPool(matchId, spellPool)</code></li>
                    <li><code>onActionPrompt</code> → call <code>doAction(matchId, action)</code></li>
                    <li><code>onGameOver</code> → log outcome, continue queueing</li>
                </ol>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">First Working Agent Example</h2>
                <p class="mt-3 text-slate-200">
                    This baseline policy is intentionally simple: first legal choice for picks/spells and a deterministic action fallback.
                </p>
                <pre class="mt-4 overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100"><code>{`import { AgentConnection, Ally, Character, Spell } from 'YOUR_SDK_IMPORT';

function chooseSpellPool(availableSpells: Spell[]): string[] {
  return availableSpells.slice(0, 6).map((spell) => spell.id);
}

function firstLivingEnemy(enemy: Character[]): Character | undefined {
  return enemy.find((unit) => unit.hp > 0);
}

function chooseAction(ally: Ally[], enemy: Character[]) {
  const actor = ally.find((unit) => unit.canAct && unit.hp > 0 && unit.stamina > 0);
  const target = firstLivingEnemy(enemy);

  if (!actor) return undefined;

  const availableSpell = actor.spells.find((spell) => spell.available);
  if (availableSpell && target) {
    return {
      id: availableSpell.id,
      type: 'spell',
      source: actor.id,
      target: [target.id],
    };
  }

  const attack = actor.attacks[0];
  if (attack && target) {
    return {
      id: attack.id,
      type: 'attack',
      source: actor.id,
      target: [target.id],
    };
  }

  return {
    id: 'defend',
    type: 'defend',
    source: actor.id,
  };
}

async function run() {
  const connection = new AgentConnection('localhost:8787', 'your-username', 'starter-agent', '0.1.0');
  await connection.connect();

  connection.onQueuePop((matchId) => {
    connection.joinGame(matchId);
  });

  connection.onCharacterPrompt((matchId, availableCharacters) => {
    const selected = availableCharacters[0];
    if (selected) connection.pickCharacter(matchId, selected.id);
  });

  connection.onSpellsPrompt((matchId, availableSpells) => {
    connection.setSpellPool(matchId, chooseSpellPool(availableSpells));
  });

  connection.onActionPrompt((matchId, status) => {
    const action = chooseAction(status.ally, status.enemy);
    if (action) connection.doAction(matchId, action);
  });

  connection.onGameOver((matchId) => {
    console.log('game finished', matchId);
  });

  connection.onError((error) => {
    console.error('sdk/server error', error);
  });

  connection.joinQueue();
}

run().catch(console.error);`}</code></pre>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Action Shape</h2>
                <p class="mt-3 text-slate-200">
                    The runtime expects an action payload with this structure:
                </p>
                <pre class="mt-4 overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100"><code>{`type ActionRequest = {
  id: string;
  type: 'attack' | 'spell' | 'defend' | string;
  source: string;
  target?: string[];
};`}</code></pre>
                <p class="mt-3 text-sm text-slate-300">
                    In current game logic, <code>type</code> values handled explicitly are <code>attack</code>, <code>spell</code>, and <code>defend</code>.
                </p>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Next Step</h2>
                <p class="mt-3 text-slate-200">
                    Use <a class="text-blue-300 hover:text-blue-200" href="/docs/sdk-reference">SDK Reference</a> as your checklist while hardening reconnects, status requests, and telemetry.
                </p>
            </section>
        </DocsPageLayout>
    );
}