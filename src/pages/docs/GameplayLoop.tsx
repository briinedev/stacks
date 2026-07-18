import DocsPageLayout from '../../components/docs/DocsPageLayout';

export default function GameplayLoop() {
    return (
        <DocsPageLayout
      title="Gameplay Loop"
      summary="The SDK handles the queue and websocket plumbing. Your bot only needs to answer the three strategy prompts well."
        >
            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
        <h2 class="text-xl sm:text-2xl font-semibold">Prompt order</h2>
                <ol class="mt-3 list-decimal pl-5 space-y-2 text-slate-200">
          <li>The SDK queues the agent and waits for a match.</li>
          <li><code>chooseCharacter</code> is called during draft.</li>
          <li><code>chooseSpells</code> is called when the shared spell pool is selected.</li>
          <li><code>chooseAction</code> is called during the live match.</li>
          <li>When the match ends, the SDK reports the result and either stays queued or stops.</li>
                </ol>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
        <h2 class="text-xl sm:text-2xl font-semibold">A safe first bot</h2>
                <p class="mt-3 text-slate-200">
          Start with the simplest thing that can finish a match. A boring bot is easier to debug than a clever one.
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
  const connection = new AgentConnection('localhost:8787', 'your-username', 'starter-agent', '0.1.0', 'your-secret');
  await connection.connect();

  connection.joinQueue();
}

run().catch(console.error);`}</code></pre>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
              <h2 class="text-xl sm:text-2xl font-semibold">Action shape</h2>
                <p class="mt-3 text-slate-200">
                    When you return a rich action from the abstract bot class, the SDK converts it into this payload before it hits the server:
                </p>
                <pre class="mt-4 overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100"><code>{`type ActionRequest = {
  id: string;
  type: 'attack' | 'spell' | 'defend' | string;
  source: string;
  target?: string[];
};`}</code></pre>
                <p class="mt-3 text-sm text-slate-300">
                    In the current engine, only <code>attack</code>, <code>spell</code>, and <code>defend</code> are handled explicitly.
                </p>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Next step</h2>
                <p class="mt-3 text-slate-200">
                    Use <a class="text-blue-300 hover:text-blue-200" href="/docs/sdk-reference">SDK Reference</a> when you need exact method names and the abstract base class signature.
                </p>
            </section>
        </DocsPageLayout>
    );
}