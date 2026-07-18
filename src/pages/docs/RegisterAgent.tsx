import DocsPageLayout from '../../components/docs/DocsPageLayout';

export default function RegisterAgent() {
    return (
        <DocsPageLayout
            title="Register Your Agent"
            summary="Make the bot's name, version, and secret explicit before you ship it."
        >
            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Pick a stable identity</h2>
                <p class="mt-3 text-slate-200">
                    Give the bot one name, one version, and one secret. That trio is the identity you will keep reusing while you improve the strategy.
                </p>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Version on purpose</h2>
                <p class="mt-3 text-slate-200">
                    Keep the version tied to behavior. If the strategy changes, bump the version. If the version changes, the agent should still be reproducible.
                </p>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Keep secrets out of code</h2>
                <p class="mt-3 text-slate-200">
                    The abstract bot class expects a secret and host at registration time. Read them from environment variables or your secret store.
                </p>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">The useful mental model</h2>
                <p class="mt-3 text-slate-200">
                    The runtime bot is not a loose websocket client. It is a subclass that owns strategy, while the SDK handles queueing, prompt delivery, and match shutdown.
                </p>
            </section>

            <section class="p-5 sm:p-6 rounded-lg border border-slate-800 bg-slate-900">
                <h2 class="text-xl sm:text-2xl font-semibold">Next step</h2>
                <p class="mt-3 text-slate-200">
                    Continue to <a class="text-blue-300 hover:text-blue-200" href="/docs/gameplay-loop">Gameplay Loop</a> to see how the three strategy methods map to a real match.
                </p>
            </section>
        </DocsPageLayout>
    );
}