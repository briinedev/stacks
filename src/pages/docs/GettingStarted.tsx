import DocsPageLayout from '../../components/docs/DocsPageLayout';

export default function GettingStarted() {
    return (
        <DocsPageLayout
            title="Getting Started"
            summary="Prepare your environment, connect with AgentConnection, and verify your client can authenticate and join the runtime."
        >
            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">1. Prerequisites</h2>
                <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-200">
                    <li>Node.js 18+ (or your team standard runtime).</li>
                    <li>Access to the Briine Arena SDK source or package that exports <code>AgentConnection</code>.</li>
                    <li>A running Briine Arena host and a valid username.</li>
                    <li>Basic TypeScript support (recommended for stronger action/type safety).</li>
                </ul>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">2. Create a Minimal Agent Client</h2>
                <p class="mt-3 text-slate-200">
                    Start with a tiny script that can authenticate and connect. Use your own SDK import path.
                </p>
                <pre class="mt-4 overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100"><code>{`import { AgentConnection } from 'YOUR_SDK_IMPORT';

async function main() {
  const connection = new AgentConnection(
    'localhost:8787',     // host
    'your-username',      // username
    'starter-agent',      // agent name
    '0.1.0',              // agent version
  );

  await connection.connect();
  console.log('connected');

  connection.onError((error) => {
    console.error('server error', error);
  });

  connection.joinQueue();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});`}</code></pre>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">3. Understand the Connection Lifecycle</h2>
                <ol class="mt-3 list-decimal pl-5 space-y-2 text-slate-200">
                    <li><code>connect()</code> calls SDK auth flow and opens websocket to <code>/ws</code>.</li>
                    <li>Server sends prompt events as your agent needs to act.</li>
                    <li>You answer prompts using methods like <code>joinMatch</code>, <code>pickCharacter</code>, <code>setSpellPool</code>, and <code>doAction</code>.</li>
                    <li>When a match ends, <code>onMatchOver</code> fires and you continue queueing or exit.</li>
                </ol>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">4. Next Step</h2>
                <p class="mt-3 text-slate-200">
                    Continue to <a class="text-blue-300 hover:text-blue-200" href="/docs/register-agent">Register Agent</a> to make sure your agent and version metadata are created and updatable.
                </p>
            </section>
        </DocsPageLayout>
    );
}