import { useEffect, useState } from 'preact/hooks';
import SiteLayout from '../components/SiteLayout';

type AgentInfo = {
    name?: string;
};

type AgentVersionInfo = {
    version?: string;
    elo?: number;
};

type HistoryGame = {
    id: string;
    version: string;
    north: string;
    south: string;
    status: string;
    north_agent_version_id: string;
    south_agent_version_id: string;
    nwin: boolean;
    length: number;
    created_at: string;
};

type HistoryResponse = {
    success: boolean;
    agent?: AgentInfo;
    user?: User;
    version?: AgentVersionInfo;
    history?: HistoryGame[];
};

type User = {
    username: string;
};

export default function AgentProfile({ agentVersionId }: { agentVersionId: string }) {
    const [user, setUser] = useState(undefined as User | undefined);
    const [agent, setAgent] = useState(undefined as AgentInfo | undefined);
    const [versionInfo, setVersionInfo] = useState(undefined as AgentVersionInfo | undefined);
    const [history, setHistory] = useState([] as HistoryGame[]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null as string | null);

    useEffect(() => {
        let canceled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_HOST}/history/${agentVersionId}?page=${page}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch agent history');
                }
                const data = (await res.json()) as HistoryResponse;

                if (!data.success) {
                    throw new Error('History endpoint returned an unsuccessful response');
                }

                if (!canceled) {
                    setUser(data.user);
                    setAgent(data.agent);
                    setVersionInfo(data.version);
                    setHistory(data.history || []);
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to fetch agent history';
                if (!canceled) {
                    setError(message);
                    setHistory([]);
                }
            } finally {
                if (!canceled) setLoading(false);
            }
        };

        load();
        return () => {
            canceled = true;
        };
    }, [agentVersionId, page]);

    const hasPreviousPage = page > 1;
    const hasNextPage = history.length >= 10;

    return (
        <SiteLayout>
            <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                {loading && <div class="text-slate-300">Loading agent profile...</div>}
                {!loading && error && <div class="text-red-300">{error}</div>}

                {!loading && !error && !agent && (
                    <div>
                        <h1 class="text-3xl sm:text-5xl font-bold">Unknown Agent Version</h1>
                        <p class="mt-3 text-slate-300">No public profile data was found for this agent version.</p>
                    </div>
                )}

                {!loading && !error && agent && (
                    <>
                        <h1 class="text-3xl sm:text-5xl font-bold break-words">
                            {agent.name || 'Unnamed Agent'} <span class="text-slate-300">{versionInfo?.version || 'Unknown Version'}</span>
                        </h1>
                        <p class="mt-3 text-slate-300">
                            Maintained by{' '}
                            {user ? <a href={`/users/${user.username}`}>{user.username}</a> : 'Unknown User'}
                        </p>

                        <section class="mt-6 p-5 rounded-lg border border-slate-800 bg-slate-900">
                            <div class="text-slate-300">Current Rating</div>
                            <div class="text-4xl font-bold mt-1">{versionInfo?.elo ?? 'N/A'}</div>
                        </section>

                        <section class="mt-6 p-5 rounded-lg border border-slate-800 bg-slate-900">
                            <div class="flex items-center justify-between gap-3 flex-wrap">
                                <h2 class="text-xl font-semibold">Match History</h2>
                                <div class="flex items-center gap-2 text-sm">
                                    <button
                                        type="button"
                                        class="px-3 py-1 rounded border border-slate-700 disabled:opacity-40"
                                        onClick={() => setPage(current => Math.max(1, current - 1))}
                                        disabled={!hasPreviousPage}
                                    >
                                        Previous
                                    </button>
                                    <span class="text-slate-300">Page {page}</span>
                                    <button
                                        type="button"
                                        class="px-3 py-1 rounded border border-slate-700 disabled:opacity-40"
                                        onClick={() => setPage(current => current + 1)}
                                        disabled={!hasNextPage}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>

                            <div class="mt-3 space-y-2">
                                {history.length === 0 && <div class="text-slate-300">No public matches found for this page.</div>}
                                {history.map(game => {
                                    const isNorth = game.north_agent_version_id === agentVersionId;
                                    const won = isNorth ? game.nwin : !game.nwin;

                                    return (
                                        <div key={game.id} class="rounded border border-slate-800 p-3">
                                            <div class="flex items-center justify-between gap-2 flex-wrap">
                                                <a href={`/replay/${game.id}`}>Replay {game.id.slice(0, 10)}...</a>
                                                <span class={won ? 'text-emerald-300' : 'text-rose-300'}>{won ? 'Win' : 'Loss'}</span>
                                            </div>
                                            <div class="text-xs text-slate-400 mt-1">
                                                Status: {game.status} • Length: {game.length} turns • {new Date(game.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </>
                )}
            </main>
        </SiteLayout>
    );
}
