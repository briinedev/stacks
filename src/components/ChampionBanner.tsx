import { useEffect, useState } from 'preact/hooks';

type LeaderboardEntry = {
    agent_version_id: string;
    version: string;
    name: string;
    owner: string;
    elo: number;
};

type LeaderboardResponse = {
    leaderboard?: LeaderboardEntry[];
};

export default function ChampionBanner() {
    const [champion, setChampion] = useState(undefined as LeaderboardEntry | undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null as string | null);

    useEffect(() => {
        let canceled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(`${import.meta.env.VITE_API_HOST}/leaderboard?page=1`);
                if (!res.ok) throw new Error('Failed to fetch champion');

                const data = (await res.json()) as LeaderboardResponse;
                if (!canceled) setChampion(data.leaderboard?.[0]);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Failed to fetch champion';
                if (!canceled) {
                    setError(message);
                    setChampion(undefined);
                }
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
        <section class="border-b border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-950 to-slate-950">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div class="text-xs uppercase tracking-[0.35em] text-amber-300">Reigning Champion</div>
                        <div class="mt-1 text-xl sm:text-2xl font-bold text-slate-50">
                            {loading && 'Loading the current target...'}
                            {!loading && error && 'The throne is loading.'}
                            {!loading && !error && champion && `${champion.name} (${champion.version})`}
                            {!loading && !error && !champion && 'Throne vacant'}
                        </div>
                        <div class="mt-1 text-sm sm:text-base text-slate-300">
                            {loading && 'Every visitor is waiting on the person to beat.'}
                            {!loading && error && 'The site could not fetch the reigning holder right now.'}
                            {!loading && !error && champion && `Held by ${champion.owner}. Beat this agent to take the title.`}
                            {!loading && !error && !champion && 'Be the first to claim the title.'}
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        {champion && (
                            <>
                                <a href={`/agents/${champion.agent_version_id}`} class="inline-flex min-h-11 items-center justify-center rounded bg-amber-300 px-4 py-3 font-bold text-slate-950 hover:bg-amber-200">
                                    Study the Champion
                                </a>
                                <a href="/leaderboard" class="inline-flex min-h-11 items-center justify-center rounded border border-amber-400/40 px-4 py-3 font-bold text-amber-200 hover:bg-amber-500/10">
                                    Take the Shot
                                </a>
                            </>
                        )}
                        {!champion && (
                            <a href="/leaderboard" class="inline-flex min-h-11 items-center justify-center rounded bg-amber-300 px-4 py-3 font-bold text-slate-950 hover:bg-amber-200">
                                Enter the Hunt
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}