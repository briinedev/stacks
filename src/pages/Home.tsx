import { IconArrowRight, IconBrandDiscord, IconBrandGithub } from '@tabler/icons-preact';
import { useEffect, useState } from 'preact/hooks';
import GameViewer from '../components/GameViewer';
import Latest from '../components/Latest';
import { chroniclePosts, editorialBrand, getCategoryMeta } from '../content/chronicles';

type LeaderboardEntry = {
    agent_version_id: string;
    version: string;
    name: string;
    owner: string;
    elo: number;
};

type Stats = {
    queue: number;
    pairings: number;
};

type LeaderboardResponse = {
    leaderboard?: LeaderboardEntry[];
};

type FeaturedMatchResponse = {
    match?: {
        id?: string;
    };
};

export default function Home() {
    const [leaderboard, setLeaderboard] = useState([] as LeaderboardEntry[]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const [leaderboardError, setLeaderboardError] = useState(null as string | null);

    const [stats, setStats] = useState(undefined as Stats | undefined);

    const [featured, setFeatured] = useState(undefined as string | undefined);
    const launchPost = chroniclePosts[0];

    useEffect(() => {
        let canceled = false;

        setLoadingLeaderboard(true);
        setLeaderboardError(null);

        fetch(import.meta.env.VITE_API_HOST + '/leaderboard')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch leaderboard');
                return res.json() as Promise<LeaderboardResponse>;
            })
            .then(data => {
                if (canceled) return;
                setLeaderboard(data.leaderboard || []);
            })
            .catch((error: unknown) => {
                if (canceled) return;
                const message = error instanceof Error ? error.message : 'Failed to fetch leaderboard';
                setLeaderboardError(message);
                setLeaderboard([]);
            })
            .finally(() => {
                if (!canceled) setLoadingLeaderboard(false);
            });

        return () => {
            canceled = true;
        };
    }, []);

    useEffect(() => {
        fetch(import.meta.env.VITE_API_HOST + '/stats')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch stats');
                return res.json() as Promise<Stats>;
            })
            .then(data => {
                setStats(data);
            })
            .catch((error: unknown) => {
                console.error('Failed to fetch stats:', error);
            });
    }, []);

    useEffect(() => {
        fetch(import.meta.env.VITE_API_HOST + '/latest/highest-rated')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch featured agent');
                return res.json() as Promise<FeaturedMatchResponse>;
            })
            .then(data => {
                setFeatured(data.match?.id);
            })
            .catch((error: unknown) => {
                console.error('Failed to fetch featured agent:', error);
            });
    }, []);

    return (
        <main class="px-4 sm:px-6 lg:px-8 pb-16 max-w-6xl mx-auto">
            <section class="text-center mt-10 mb-10 sm:mt-12 sm:mb-12">
                <div class="mx-auto max-w-3xl">
                    <img src="/favicon.svg" class="w-14 sm:w-16 h-auto inline-block" />
                    <span class="text-2xl sm:text-3xl block font-bold mt-2 break-words">Briine</span>
                    <div class="p-4 text-sm sm:text-base break-words">
                        <a href="https://github.com/briinedev" target="_blank" class="text-white hover:text-blue-500">
                            <IconBrandGithub class="inline-block" /> Github
                        </a>
                        <a href="https://discord.gg/24EcfGggDu" target="_blank" class="text-white hover:text-blue-500 ml-4">
                            <IconBrandDiscord class="inline-block" /> Discord
                        </a>
                    </div>
                </div>
            </section>

            <section class="text-center border p-5 sm:p-8 my-8 bg-gray-900 rounded-lg">
                <h2 class="text-2xl sm:text-4xl block mb-3 sm:mb-4 break-words">Write Your Agent</h2>
                <h3 class="text-3xl sm:text-5xl block break-words">Compete Through Code</h3>
                <p class="my-4 text-base sm:text-xl lg:text-2xl max-w-3xl mx-auto break-words">
                    See how your code stacks up against other developers worldwide in a strategic battle of drafts, shared resource management, and ever-evolving tactics.
                </p>

                {
                    stats && (
                        <div class="mt-4 text-sm sm:text-base lg:text-lg break-words">
                            <span class="font-semibold">{stats.queue}</span> agents queued - <span class="font-semibold">{stats.pairings}</span> pairings in progress
                        </div>
                    )
                }

                <div class="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-xl mx-auto">
                    <a href="/docs" class="min-h-11 px-4 py-3 bg-blue-300 font-bold text-gray-900 inline-flex items-center justify-center rounded text-base">
                        Get Started <IconArrowRight class="inline-block ml-1" />
                    </a>
                    <a href="/rules" class="min-h-11 px-4 py-3 bg-gray-300 font-bold text-gray-900 inline-flex items-center justify-center rounded text-base">
                        Learn the Rules <IconArrowRight class="inline-block ml-1" />
                    </a>
                </div>
            </section>

            <section class="mt-10 sm:mt-12">
                <h3 class="text-2xl sm:text-4xl text-center p-2 sm:p-4 break-words">Featured Match</h3>
                <div class="w-full overflow-hidden">
                    { featured && <GameViewer matchId={featured} /> }
                </div>
            </section>

            <section class="mt-12">
                <h3 class="text-2xl sm:text-4xl mb-4 block text-center break-words">Recent Matches</h3>
                <Latest />
            </section>

            <section class="mt-12">
                <h3 class="text-2xl sm:text-4xl mb-4 block text-center break-words">Global Leaderboard</h3>

                <div class="md:hidden grid grid-cols-1 gap-3">
                    {loadingLeaderboard && (
                        <div class="p-3 border border-gray-700 bg-gray-900 rounded text-gray-300">Loading leaderboard...</div>
                    )}
                    {!loadingLeaderboard && leaderboardError && (
                        <div class="p-3 border border-red-800 bg-gray-900 rounded text-red-300 break-words">Unable to load leaderboard: {leaderboardError}</div>
                    )}
                    {!loadingLeaderboard && !leaderboardError && leaderboard.length === 0 && (
                        <div class="p-3 border border-gray-700 bg-gray-900 rounded text-gray-300">No leaderboard entries yet.</div>
                    )}
                    {!loadingLeaderboard && !leaderboardError && leaderboard.map((entry, index) => (
                        <div key={entry.agent_version_id} class="p-3 border border-gray-700 bg-gray-900 rounded">
                            <div class="text-sm text-gray-300">#{index + 1}</div>
                            <div class="font-bold break-words">{entry.name}</div>
                            <div class="text-sm text-gray-300 break-words">by {entry.owner}</div>
                            <div class="mt-1 text-lg">{entry.elo}</div>
                        </div>
                    ))}
                </div>

                <div class="hidden md:block w-full overflow-x-auto">
                    <table class="w-full min-w-[640px] table-auto text-left border-collapse border border-gray-400 bg-gray-900">
                        <thead class="border-b">
                            <tr>
                                <th class="p-2">Rank</th>
                                <th class="p-2">Agent</th>
                                <th class="p-2">Author</th>
                                <th class="p-2">Rating</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y gap-2">
                            {loadingLeaderboard && (
                                <tr>
                                    <td class="p-2 text-gray-300" colSpan={4}>Loading leaderboard...</td>
                                </tr>
                            )}
                            {!loadingLeaderboard && leaderboardError && (
                                <tr>
                                    <td class="p-2 text-red-300" colSpan={4}>Unable to load leaderboard: {leaderboardError}</td>
                                </tr>
                            )}
                            {!loadingLeaderboard && !leaderboardError && leaderboard.length === 0 && (
                                <tr>
                                    <td class="p-2 text-gray-300" colSpan={4}>No leaderboard entries yet.</td>
                                </tr>
                            )}
                            {!loadingLeaderboard && !leaderboardError && leaderboard.map((entry, index) => (
                                <tr key={entry.agent_version_id}>
                                    <td class="p-2">#{index + 1}</td>
                                    <td class="p-2 break-words"><a href={`/agents/${entry.agent_version_id}`}>{entry.name} ({entry.version})</a></td>
                                    <td class="p-2 break-words"><a href={`/users/${entry.owner}`}>{entry.owner}</a></td>
                                    <td class="p-2">{entry.elo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div class="text-center mt-4">
                    <a href="/leaderboard" class="min-h-11 px-4 py-3 bg-blue-300 font-bold text-gray-900 inline-flex items-center justify-center rounded text-base">
                        See All <IconArrowRight class="inline-block ml-1" />
                    </a>
                </div>
            </section>

            <section class="mt-12 mb-12">
                <div class="flex items-center justify-between gap-3 flex-wrap mb-4">
                    <h3 class="text-2xl sm:text-4xl block break-words">{editorialBrand.title}</h3>
                    <a href="/chronicles" class="inline-flex items-center text-sky-300 hover:text-sky-200">
                        Read launch post <IconArrowRight class="inline-block ml-1" />
                    </a>
                </div>

                <p class="text-slate-300 max-w-3xl">
                    The site launches with one editorial post that explains what Briine is and where the platform goes next.
                </p>

                {launchPost && (
                    <div class="mt-6 max-w-3xl">
                        <article class="rounded-xl border border-slate-800 bg-gray-900 p-5">
                            <div class="text-sm text-sky-300">{getCategoryMeta(launchPost.category)?.label}</div>
                            <h4 class="mt-2 text-xl font-semibold break-words">{launchPost.title}</h4>
                            <p class="mt-3 text-slate-300 text-sm sm:text-base">{launchPost.summary}</p>
                            <div class="mt-4 text-xs text-slate-400">{launchPost.publishedAt} • {launchPost.readMinutes} min read</div>
                            <a href={`/chronicles/${launchPost.slug}`} class="mt-4 inline-flex text-sky-300 hover:text-sky-200">
                                Read launch post →
                            </a>
                        </article>
                    </div>
                )}
            </section>

            <section class="mt-12 mb-12">
                <h3 class="text-2xl sm:text-4xl mb-4 block text-center break-words">Start Your Journey</h3>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-center">
                    <div class="p-4 bg-gray-900 rounded border border-gray-800">
                        <h4 class="text-xl sm:text-2xl p-2 sm:p-4 break-words">Create Your Agent</h4>
                        <p class="text-base sm:text-lg break-words">Using our <a href="/docs">TypeScript SDK</a>, or your favorite language through our <a href="/docs">WebSocket protocol</a>.</p>
                    </div>
                    <div class="p-4 bg-gray-900 rounded border border-gray-800">
                        <h4 class="text-xl sm:text-2xl p-2 sm:p-4 break-words">Compete</h4>
                        <p class="text-base sm:text-lg break-words">Connect your agent to our competitive environment to battle other agents, and find your relative rating.</p>
                    </div>
                    <div class="p-4 bg-gray-900 rounded border border-gray-800">
                        <h4 class="text-xl sm:text-2xl p-2 sm:p-4 break-words">Improve</h4>
                        <p class="text-base sm:text-lg break-words">Analyze completed matches, refine your strategies, and improve your rating in an ever-evolving battlefield.</p>
                    </div>
                </div>
            </section>

            <section class="mt-12 mb-12">
                <h3 class="text-2xl sm:text-4xl mb-4 block text-center break-words">Core Features</h3>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
                    <div class="p-4 bg-gray-900 rounded border border-gray-800">
                        <h4 class="text-xl sm:text-2xl p-2 sm:p-4 break-words">Deterministic Matches</h4>
                        <p class="text-base sm:text-lg break-words">All matches are entirely devoid of randomness, other than which team begins the match.</p>
                    </div>
                    <div class="p-4 bg-gray-900 rounded border border-gray-800">
                        <h4 class="text-xl sm:text-2xl p-2 sm:p-4 break-words">Team Roster Draft Pick</h4>
                        <p class="text-base sm:text-lg break-words">Counterpick your opponents in a draft pick of 3 controllable characters in your match.</p>
                    </div>
                    <div class="p-4 bg-gray-900 rounded border border-gray-800">
                        <h4 class="text-xl sm:text-2xl p-2 sm:p-4 break-words">Strategic Action Selection</h4>
                        <p class="text-base sm:text-lg break-words">Select up to 8 powerful abilities that work well with your selected characters and strategy.</p>
                    </div>
                    <div class="p-4 bg-gray-900 rounded border border-gray-800">
                        <h4 class="text-xl sm:text-2xl p-2 sm:p-4 break-words">Shared Action Economy</h4>
                        <p class="text-base sm:text-lg break-words">Actions interact with The Stack, a shared resource between sides. Choose wisely!</p>
                    </div>
                </div>
            </section>
        </main>
    );
}
