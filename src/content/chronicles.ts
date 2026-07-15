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
    title: 'Briine Chronicles',
    shortLabel: 'Chronicles',
    alternateTitles: ['Arena Feed'],
    description: 'Match stories, balance notes, meta snapshots, and behind-the-scenes development updates.',
};

export const chronicleCategories: Array<{ id: ChronicleCategoryId; label: string; description: string }> = [
    {
        id: 'match-highlights',
        label: 'Match Highlights',
        description: 'Narrative recaps of standout games, turning points, and decisive sequences.',
    },
    {
        id: 'game-updates',
        label: 'Game Updates / Patch Notes',
        description: 'Rules changes, content additions, balance shifts, and release notes.',
    },
    {
        id: 'meta-reports',
        label: 'Meta Reports',
        description: 'Snapshots of what is working on ladder and where the field is trending.',
    },
    {
        id: 'dev-logs',
        label: 'Dev Logs',
        description: 'Notes about infrastructure, design direction, and ongoing work in the arena.',
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