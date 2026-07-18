import { ComponentType } from 'preact';

export type ChronicleCategoryId = 'match-highlights' | 'game-updates' | 'meta-reports' | 'dev-logs';

export type ChroniclePost = {
    slug: string;
    title: string;
    summary: string;
    category: ChronicleCategoryId;
    publishedAt: string;
    author: string;
    readMinutes: number;
    tags: string[];
    featured?: boolean;
    Content: ComponentType<Record<string, unknown>>;
};

type ChroniclePostMetadata = Omit<ChroniclePost, 'Content'>;

type ChronicleMdxModule = {
    default: ComponentType<Record<string, unknown>>;
    metadata: ChroniclePostMetadata;
};

export const editorialBrand = {
    title: 'Launch Notes',
    shortLabel: 'Launch',
    alternateTitles: ['Briine Launch Notes'],
    description: 'The initial public post for Briine and the place for future platform launch notes.',
};

export const chronicleCategories: Array<{ id: ChronicleCategoryId; label: string; description: string }> = [
    {
        id: 'dev-logs',
        label: 'Launch Notes',
        description: 'The first public post and future launch-level platform updates.',
    },
];

const chronicleModules = import.meta.glob<ChronicleMdxModule>('./chronicles/*.mdx', { eager: true });

export const chroniclePosts: ChroniclePost[] = Object.values(chronicleModules)
    .map(module => ({
        ...module.metadata,
        Content: module.default,
    }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export function getCategoryMeta(categoryId: ChronicleCategoryId) {
    return chronicleCategories.find(category => category.id === categoryId);
}

export function getChroniclePost(slug: string) {
    return chroniclePosts.find(post => post.slug === slug);
}