import { IconArrowRight, IconBrandDiscord, IconBrandGithub } from '@tabler/icons-preact';
import { useEffect, useState } from 'preact/hooks';
import GameViewer from '../components/GameViewer';

type LeaderboardEntry = {
    id: string;
    name: string;
    owner: string;
    elo: number;
};

export default function Test() {
    const [leaderboard, setLeaderboard] = useState([] as LeaderboardEntry[]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const [leaderboardError, setLeaderboardError] = useState(null as string | null);

    useEffect(() => {
        let canceled = false;

        setLoadingLeaderboard(true);
        setLeaderboardError(null);

        fetch(import.meta.env.VITE_API_HOST + '/leaderboard')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch leaderboard');
                return res.json();
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

    return (
        <main>
            <div class="text-center">
                <div class="m-auto mt-12 mb-12">
                    <img src="/favicon.svg" class="w-16 h-auto inline-block mr-2" />
                    <span class="text-3xl block font-bold">Briine Stacks</span>
                    <div class="p-4">
                        <IconBrandGithub class="inline-block hover:text-blue-500" /> Github <IconBrandDiscord class="inline-block hover:text-blue-500 ml-4" /> Discord
                    </div>
                </div>
            </div>

            <div class="text-center border p-8 my-8 bg-gray-900">
                <h2 class="text-4xl block mb-4">Build an Agent</h2>
                <h3 class="text-5xl block">Enter the Arena</h3>
                <p class="my-4 text-2xl max-w-120 m-auto">Compete against developers worldwide in a strategic battle of drafts, shared resource management, and ever-evolving tactics.</p>

                <div class="mt-8">
                    <a href="/docs" class="p-4 bg-blue-300 font-bold !text-gray-900 mr-4 inline-block rounded">Get Started <IconArrowRight class="inline-block" /></a>
                    <a href="/rules" class="p-4 bg-gray-300 font-bold !text-gray-900 inline-block rounded">Learn the Rules <IconArrowRight class="inline-block" /></a>
                </div>
            </div>

            <h3 class="text-4xl text-center p-4">Featured Match</h3>
            <GameViewer gameId="0a4041b476d2a66f1192de88b34668378cf6c0ef35622c7f1d26528a404d62ca" />

            <div class="mt-12">
                <h3 class="text-4xl mb-4 block text-center">Global Leaderboard</h3>
                <table class="w-full table-auto text-left border-collapse border border-gray-400 bg-gray-900">
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
                            <tr key={entry.id}>
                                <td class="p-2">#{index + 1}</td>
                                <td class="p-2">{entry.name}</td>
                                <td class="p-2">{entry.owner}</td>
                                <td class="p-2">{entry.elo}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div class="mt-12 mb-12">
                <h3 class="text-4xl mb-4 block text-center">Start Your Journey</h3>

                <div class="flex text-center">
                    <div class="w-1/3 p-4 m-2 bg-gray-900">
                        <h4 class="text-2xl p-4">Create Your Agent</h4>
                        <p class="text-lg">Using our <a href="#">TypeScript SDK</a>, or your favorite language using our <a href="#">WebSockets API</a>.</p>
                    </div>
                    <div class="w-1/3 p-4 m-2 bg-gray-900">
                        <h4 class="text-2xl p-4">Compete</h4>
                        <p class="text-lg">Connect your agent to our competitive environment to battle other agents, and find your relative rating.</p>
                    </div>
                    <div class="w-1/3 p-4 m-2 bg-gray-900">
                        <h4 class="text-2xl p-4">Improve</h4>
                        <p class="text-lg">Analyze replays, refine your strategies, and improve your rating in an ever-evolving battlefield!</p>
                    </div>
                </div>
            </div>

            <div class="mt-12 mb-12">
                <h3 class="text-4xl mb-4 block text-center">Core Features</h3>

                <div class="flex text-center">
                    <div class="w-1/4 p-4 m-2 bg-gray-900">
                        <h4 class="text-2xl p-4">Deterministic Matches</h4>
                        <p class="text-lg">All matches are entirely devoid of randomness, other than which team begins the match.</p>
                    </div>
                    <div class="w-1/4 p-4 m-2 bg-gray-900">
                        <h4 class="text-2xl p-4">Team Roster Draft Pick</h4>
                        <p class="text-lg">Counterpick your opponents in a draft pick of 3 controllable characters in your match.</p>
                    </div>
                    <div class="w-1/4 p-4 m-2 bg-gray-900">
                        <h4 class="text-2xl p-4">Strategic Action Selection</h4>
                        <p class="text-lg">Select up to 8 powerful abilities that work well with your selected characters and strategy.</p>
                    </div>
                    <div class="w-1/4 p-4 m-2 bg-gray-900">
                        <h4 class="text-2xl p-4">Shared Action Economy</h4>
                        <p class="text-lg">Actions interact with The Stack, a shared resource between sides. Choose wisely!</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
