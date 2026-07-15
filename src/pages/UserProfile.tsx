import { useEffect, useState } from 'preact/hooks';

type LeaderboardEntry = {
    agent_version_id: string;
    version: string;
    name: string;
    owner: string;
    elo: number;
};

export default function UserProfile({ username }: { username: string }) {
    const [entries, setEntries] = useState([] as LeaderboardEntry[]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let canceled = false;

        const load = async () => {
            setLoading(true);
            try {
                const all = [] as LeaderboardEntry[];
                for (let page = 1; page <= 20; page++) {
                    const res = await fetch(`${import.meta.env.VITE_API_HOST}/leaderboard?page=${page}`);
                    if (!res.ok) break;
                    const data = await res.json();
                    const chunk = (data.leaderboard || []) as LeaderboardEntry[];
                    if (!chunk.length) break;
                    all.push(...chunk);
                    if (chunk.length < 10) break;
                }

                if (!canceled) {
                    setEntries(all.filter(entry => entry.owner.toLowerCase() === username.toLowerCase()));
                }
            } finally {
                if (!canceled) setLoading(false);
            }
        };

        load();
        return () => {
            canceled = true;
        };
    }, [username]);

    return (
        <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <h1 class="text-3xl sm:text-5xl font-bold break-words">{username}</h1>
            <p class="mt-2 text-slate-300">Public agent versions visible in the leaderboard.</p>

            {loading && <div class="mt-6 text-slate-300">Loading profile...</div>}

            {!loading && entries.length === 0 && (
                <div class="mt-6 text-slate-300">No leaderboard entries found for this user yet.</div>
            )}

            {!loading && entries.length > 0 && (
                <div class="mt-6 overflow-x-auto">
                    <table class="w-full min-w-[640px] table-auto text-left border-collapse border border-slate-700 bg-slate-900">
                        <thead class="border-b border-slate-700">
                            <tr>
                                <th class="p-2">Agent</th>
                                <th class="p-2">Version</th>
                                <th class="p-2">Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map(entry => (
                                <tr key={entry.agent_version_id} class="border-b border-slate-800">
                                    <td class="p-2"><a href={`/agents/${entry.agent_version_id}`}>{entry.name}</a></td>
                                    <td class="p-2">{entry.version}</td>
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
