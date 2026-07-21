import { chroniclePosts, editorialBrand, getCategoryMeta } from '../content/chronicles';

export default function Chronicles() {
    const launchPost = chroniclePosts[0];

    return (
        <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <section class="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 overflow-hidden relative">
                <div class="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_rgba(125,211,252,0.25),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.18),_transparent_30%)]" />
                <div class="relative">
                    <p class="text-sm uppercase tracking-[0.25em] text-sky-300">Hill Record</p>
                    <h1 class="mt-3 text-4xl sm:text-6xl font-bold">{editorialBrand.title}</h1>
                    <p class="mt-4 max-w-3xl text-slate-300 text-base sm:text-lg">{editorialBrand.description}</p>
                </div>
            </section>

            {launchPost && (
                <section class="mt-8">
                    <article class="rounded-xl border border-slate-800 bg-slate-900 p-6">
                        <div class="text-sm text-sky-300 uppercase tracking-wide">{getCategoryMeta(launchPost.category)?.label}</div>
                        <h2 class="mt-3 text-2xl sm:text-3xl font-semibold max-w-2xl">{launchPost.title}</h2>
                        <p class="mt-3 text-slate-300 max-w-2xl">{launchPost.summary}</p>
                        <div class="mt-4 text-sm text-slate-400">
                            {launchPost.publishedAt} • {launchPost.author} • {launchPost.readMinutes} min read
                        </div>
                        <div class="mt-4 flex flex-wrap gap-2">
                            {launchPost.tags.map(tag => (
                                <span key={tag} class="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">{tag}</span>
                            ))}
                        </div>
                        <a href={`/chronicles/${launchPost.slug}`} class="mt-6 inline-flex rounded bg-sky-300 px-4 py-3 font-semibold text-slate-950 hover:bg-sky-200">
                            Read Post
                        </a>
                    </article>
                </section>
            )}
        </main>
    );
}