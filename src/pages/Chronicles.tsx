import { useMemo, useState } from 'preact/hooks';

import {
    ChronicleCategoryId,
    chronicleCategories,
    chroniclePosts,
    editorialBrand,
    getCategoryMeta,
} from '../content/chronicles';

export default function Chronicles() {
    const [activeCategory, setActiveCategory] = useState('all' as ChronicleCategoryId | 'all');

    const visiblePosts = useMemo(() => {
        if (activeCategory === 'all') return chroniclePosts;
        return chroniclePosts.filter(post => post.category === activeCategory);
    }, [activeCategory]);

    const featuredPost = chroniclePosts.find(post => post.featured) ?? chroniclePosts[0];

    return (
        <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <section class="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 overflow-hidden relative">
                <div class="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_rgba(125,211,252,0.25),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.18),_transparent_30%)]" />
                <div class="relative">
                    <p class="text-sm uppercase tracking-[0.25em] text-sky-300">Editorial Feed</p>
                    <h1 class="mt-3 text-4xl sm:text-6xl font-bold">{editorialBrand.title}</h1>
                    <p class="mt-4 max-w-3xl text-slate-300 text-base sm:text-lg">{editorialBrand.description}</p>
                    <p class="mt-2 text-sm text-slate-400">Match stories, patch notes, meta snapshots, and development notes in one place.</p>
                </div>
            </section>

            {featuredPost && (
                <section class="mt-8 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4 items-stretch">
                    <article class="rounded-xl border border-slate-800 bg-slate-900 p-6">
                        <div class="text-sm text-sky-300 uppercase tracking-wide">Featured Story</div>
                        <h2 class="mt-3 text-2xl sm:text-3xl font-semibold max-w-2xl">{featuredPost.title}</h2>
                        <p class="mt-3 text-slate-300 max-w-2xl">{featuredPost.summary}</p>
                        <div class="mt-4 text-sm text-slate-400">
                            {getCategoryMeta(featuredPost.category)?.label} • {featuredPost.publishedAt} • {featuredPost.readMinutes} min read
                        </div>
                        <a href={`/chronicles/${featuredPost.slug}`} class="mt-6 inline-flex rounded bg-sky-300 px-4 py-3 font-semibold text-slate-950 hover:bg-sky-200">
                            Read Story
                        </a>
                    </article>

                    <aside class="rounded-xl border border-slate-800 bg-slate-900 p-6">
                        <h3 class="text-lg font-semibold">Coverage Types</h3>
                        <div class="mt-4 space-y-3">
                            {chronicleCategories.map(category => (
                                <div key={category.id} class="rounded border border-slate-800 bg-slate-950 p-3">
                                    <div class="font-medium">{category.label}</div>
                                    <p class="mt-1 text-sm text-slate-300">{category.description}</p>
                                </div>
                            ))}
                        </div>
                    </aside>
                </section>
            )}

            <section class="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                <div class="flex flex-wrap gap-2">
                    <button
                        type="button"
                        class={`rounded-full border px-3 py-2 text-sm ${activeCategory === 'all' ? 'border-sky-300 bg-sky-300 text-slate-950' : 'border-slate-700 bg-slate-950 text-slate-200'}`}
                        onClick={() => setActiveCategory('all')}
                    >
                        All Posts
                    </button>
                    {chronicleCategories.map(category => (
                        <button
                            key={category.id}
                            type="button"
                            class={`rounded-full border px-3 py-2 text-sm ${activeCategory === category.id ? 'border-sky-300 bg-sky-300 text-slate-950' : 'border-slate-700 bg-slate-950 text-slate-200'}`}
                            onClick={() => setActiveCategory(category.id)}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>

                <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visiblePosts.map(post => (
                        <article key={post.slug} class="rounded-xl border border-slate-800 bg-slate-950 p-5">
                            <div class="text-sm text-sky-300">{getCategoryMeta(post.category)?.label}</div>
                            <h3 class="mt-2 text-xl font-semibold">{post.title}</h3>
                            <p class="mt-3 text-slate-300">{post.summary}</p>
                            <div class="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
                                <span>{post.publishedAt}</span>
                                <span>{post.author}</span>
                                <span>{post.readMinutes} min read</span>
                            </div>
                            <div class="mt-4 flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <span key={tag} class="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">{tag}</span>
                                ))}
                            </div>
                            <a href={`/chronicles/${post.slug}`} class="mt-5 inline-flex text-sky-300 hover:text-sky-200">
                                Open article →
                            </a>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}