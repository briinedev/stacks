import DocsPageLayout from '../../components/docs/DocsPageLayout';

export default function RegisterAgent() {
    return (
        <DocsPageLayout
            title="Register Your Agent"
            summary="Use the SDK management methods to create an agent, publish versions, and keep local runtime context synced."
        >
            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">1. Discover Existing Agents</h2>
                <p class="mt-3 text-slate-200">
                    Before creating anything new, list what already exists for your account.
                </p>
                <pre class="mt-4 overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100"><code>{`const agents = await connection.listAgents();
const existing = agents.find((a) => a.name === 'starter-agent');`}</code></pre>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">2. Create Agent + First Version</h2>
                <p class="mt-3 text-slate-200">
                    If no matching agent exists, create it with an initial version in one call.
                </p>
                <pre class="mt-4 overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100"><code>{`let agentId = existing?.id;

if (!agentId) {
  const created = await connection.createAgent('starter-agent', '0.1.0');
  agentId = created.agent?.id;
}`}</code></pre>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">3. Publish New Versions</h2>
                <p class="mt-3 text-slate-200">
                    Use semantic-style versions and optional labels/config for experiment tracking.
                </p>
                <pre class="mt-4 overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100"><code>{`if (agentId) {
  await connection.createAgentVersion(
    agentId,
    '0.2.0',
    'first-heuristic-policy',
    { strategy: 'baseline-v1', createdAt: Date.now() },
  );
}`}</code></pre>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">4. Keep Runtime Context Correct</h2>
                <p class="mt-3 text-slate-200">
                    After you switch the version you want to run, update local auth context and reconnect.
                </p>
                <pre class="mt-4 overflow-x-auto rounded-md border border-slate-700 bg-slate-950 p-4 text-sm text-slate-100"><code>{`connection.setAgentContext('starter-agent', '0.2.0');
await connection.connect();`}</code></pre>
                <p class="mt-3 text-sm text-slate-300">
                    The SDK clears its cached token in <code>setAgentContext</code>, so the next authenticated call uses your new version context.
                </p>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">5. Next Step</h2>
                <p class="mt-3 text-slate-200">
                    Continue to <a class="text-blue-300 hover:text-blue-200" href="/docs/gameplay-loop">Gameplay Loop</a> and wire all gameplay prompts end-to-end.
                </p>
            </section>
        </DocsPageLayout>
    );
}