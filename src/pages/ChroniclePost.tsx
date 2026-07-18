import { editorialBrand, getCategoryMeta, getChroniclePost } from '../content/chronicles';
import styles from './ChroniclePost.module.css';

export default function ChroniclePost({ slug }: { slug: string }) {
    const post = getChroniclePost(slug);

    if (!post) {
        return (
            <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <h1 class="text-3xl sm:text-5xl font-bold">Story Not Found</h1>
                <p class="mt-3 text-slate-300">No editorial post matched this URL.</p>
                <a href="/chronicles" class="mt-6 inline-flex rounded bg-sky-300 px-4 py-3 font-semibold text-slate-950 hover:bg-sky-200">
                    Back to {editorialBrand.title}
                </a>
            </main>
        );
    }

    const category = getCategoryMeta(post.category);

    return (
        <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <a href="/chronicles" class="text-sm text-sky-300 hover:text-sky-200">← Back to {editorialBrand.shortLabel}</a>
            <p class="mt-6 text-sm uppercase tracking-[0.25em] text-sky-300">{category?.label}</p>
            <h1 class="mt-3 text-4xl sm:text-6xl font-bold leading-tight">{post.title}</h1>
            <p class="mt-4 text-lg text-slate-300">{post.summary}</p>

            <div class="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
                <span>{post.publishedAt}</span>
                <span>{post.author}</span>
                <span>{post.readMinutes} min read</span>
            </div>

            <div class="mt-5 flex flex-wrap gap-2">
                {post.tags.map(tag => (
                    <span key={tag} class="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">{tag}</span>
                ))}
            </div>

            <article class={styles.Post + ' mt-8 rounded-xl border border-slate-800 bg-slate-950 p-6 sm:p-8'}>
                <post.Content />
            </article>
        </main>
    );
}