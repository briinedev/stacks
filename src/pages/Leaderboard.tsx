import { useEffect, useState } from 'preact/hooks';

type LeaderboardEntry = {
    agent_version_id: string;
    version: string;
    name: string;
    owner: string;
    elo: number;
};

export default function LeaderboardPage() {
    const [entries, setEntries] = useState([] as LeaderboardEntry[]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null as string | null);

    useEffect(() => {
        let canceled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                const all = [] as LeaderboardEntry[];
                for (let page = 1; page <= 20; page++) {
                    const res = await fetch(`${import.meta.env.VITE_API_HOST}/leaderboard?page=${page}`);
                    if (!res.ok) throw new Error('Failed to fetch leaderboard');
                    const data = await res.json();
                    const chunk = (data.leaderboard || []) as LeaderboardEntry[];
                    if (!chunk.length) break;
                    all.push(...chunk);
                    if (chunk.length < 10) break;
                }

                if (!canceled) setEntries(all);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
                if (!canceled) setError(message);
            } finally {
                if (!canceled) setLoading(false);
            }
        };

        load();
        return () => {
            canceled = true;
        };
    }, []);

    return (
        <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <h1 class="text-3xl sm:text-5xl font-bold">The Hill</h1>
            <p class="mt-2 text-slate-300">The current order of challengers and the title holder they are trying to unseat. Whoever reaches the top becomes the next target.</p>

            {loading && <div class="mt-6 text-slate-300">Loading leaderboard...</div>}
            {error && <div class="mt-6 text-red-300">{error}</div>}

            {!loading && !error && (
                <div class="mt-6 overflow-x-auto">
                    <table class="w-full min-w-[680px] table-auto text-left border-collapse border border-slate-700 bg-slate-900">
                        <thead class="border-b border-slate-700">
                            <tr>
                                <th class="p-2">Rank</th>
                                <th class="p-2">Contender</th>
                                <th class="p-2">Version</th>
                                <th class="p-2">Author</th>
                                <th class="p-2">Hill Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry, index) => (
                                <tr key={entry.agent_version_id} class="border-b border-slate-800">
                                    <td class="p-2">#{index + 1}</td>
                                    <td class="p-2"><a href={`/agents/${entry.agent_version_id}`}>{entry.name}</a></td>
                                    <td class="p-2">{entry.version}</td>
                                    <td class="p-2"><a href={`/users/${entry.owner}`}>{entry.owner}</a></td>
                                    <td class="p-2">{entry.elo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </main>
    );
}
