import { useState, useEffect } from 'preact/hooks';

type GameStub = {
    id: string,
    north: string,
    north_agent_name: string,
    north_agent_version: string,
    north_agent_version_id: string;
    south: string,
    south_agent_name: string,
    south_agent_version: string,
    south_agent_version_id: string;
    status: string,
    nwin: boolean,
    length: number,
    created_at: string,
};

type LatestResponse = {
    latest?: GameStub[];
};

export default function Latest() {
    const [latest, setLatest] = useState([] as GameStub[]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null as string | null);

    useEffect(() => {
        let canceled = false;

        setLoading(true);
        setError(null);

        const load = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_API_HOST + '/latest');
                const data = await response.json() as LatestResponse;
                if (!canceled) {
                    setLatest(data.latest || []);
                }
            } catch (err: unknown) {
                if (canceled) return;
                const message = err instanceof Error ? err.message : 'Failed to load recent games';
                setError(message);
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
        <div class="space-y-4">
            {loading && <div class="text-slate-300">Loading recent matches...</div>}
            {error && <div class="text-red-300">{error}</div>}

            {!loading && !error && latest.length > 0 && (
                <div class="overflow-x-auto">
                    <table class="w-full min-w-[540px] text-left border-collapse border border-slate-700 bg-slate-900">
                        <thead class="border-b border-slate-700">
                            <tr>
                                <th class="p-2">Match</th>
                                <th class="p-2">Winner</th>
                                <th class="p-2">Loser</th>
                                <th class="p-2">Length</th>
                                <th class="p-2">Played</th>
                            </tr>
                        </thead>
                        <tbody>
                            {latest.map(game => (
                                <tr key={game.id} class="cursor-pointer border-b border-slate-800 hover:bg-slate-800/70">
                                    <td class="p-2"><a href={`/game/${game.id}`}>View</a></td>
                                    <td class="p-2">
                                        <a href={game.nwin ? `/agents/${game.north_agent_version_id}` : `/agents/${game.south_agent_version_id}`}>
                                        {game.nwin ? `${game.north_agent_name} (${game.north_agent_version})` : `${game.south_agent_name} (${game.south_agent_version})`}
                                        </a>
                                    </td>
                                    <td class="p-2">
                                        <a href={game.nwin ? `/agents/${game.south_agent_version_id}` : `/agents/${game.north_agent_version_id}`}>
                                            {game.nwin ? `${game.south_agent_name} (${game.south_agent_version})` : `${game.north_agent_name} (${game.north_agent_version})`}
                                        </a>
                                    </td>
                                    <td class="p-2">{game.length}</td>
                                    <td class="p-2">{new Date(game.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && !error && latest.length === 0 && (
                <div class="text-slate-300">No recent completed matches yet.</div>
            )}
        </div>
    );
}
