import GameViewer from '../components/GameViewer';

export default function Viewer(matchId: { matchId: string }) {
    return (
        <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center">
            <section class="mt-10 sm:mt-12">
                <h3 class="text-2xl sm:text-4xl text-center p-2 sm:p-4 break-words">Match Record</h3>
                <div class="w-full overflow-hidden">
                    <GameViewer matchId={matchId.matchId} />
                </div>
            </section>
        </main>
    );
}
