import { IconArrowsShuffle, IconBiohazard, IconBolt, IconCircleFilled, IconDroplets, IconFlame, IconMoon, IconMountain, IconShield, IconSun, IconSword, IconWand, IconWind } from '@tabler/icons-preact';
import { getClassMeta } from '../../utils/characterEmulator';

type IconProps = {
    size?: number;
    className?: string;
    title?: string;
};

export function normalizeElementId(element: string): string {
    const normalized = element.toLowerCase();
    if (normalized === 'white') return 'light';
    if (normalized === 'black') return 'dark';
    return normalized;
}

function humanizeElement(value: string): string {
    return value
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function getElementMeta(element: string): { label: string; short: string; badgeClass: string } {
    switch (normalizeElementId(element)) {
        case 'red':
            return { label: 'Red', short: 'R', badgeClass: 'bg-red-500/10 border-red-500/30' };
        case 'blue':
            return { label: 'Blue', short: 'B', badgeClass: 'bg-sky-500/10 border-sky-500/30' };
        case 'green':
            return { label: 'Green', short: 'G', badgeClass: 'bg-emerald-500/10 border-emerald-500/30' };
        case 'yellow':
            return { label: 'Yellow', short: 'Y', badgeClass: 'bg-amber-500/10 border-amber-500/30' };
        case 'light':
            return { label: 'Light', short: 'L', badgeClass: 'bg-slate-200/10 border-slate-300/30' };
        case 'dark':
            return { label: 'Dark', short: 'D', badgeClass: 'bg-slate-900/70 border-slate-700/80' };
        case 'purple':
            return { label: 'Purple', short: 'P', badgeClass: 'bg-fuchsia-500/10 border-fuchsia-500/30' };
        case 'orange':
            return { label: 'Orange', short: 'O', badgeClass: 'bg-orange-500/10 border-orange-500/30' };
        default:
            return { label: humanizeElement(element), short: '?', badgeClass: 'bg-slate-500/10 border-slate-500/30' };
    }
}

export function getElementHex(element: string): string {
    switch (normalizeElementId(element)) {
        case 'red':
            return '#ef4444';
        case 'blue':
            return '#38bdf8';
        case 'green':
            return '#34d399';
        case 'yellow':
            return '#fcd34d';
        case 'light':
            return '#f8fafc';
        case 'dark':
            return '#1f2937';
        case 'purple':
            return '#e879f9';
        case 'orange':
            return '#fb923c';
        default:
            return '#cbd5e1';
    }
}

export function getReadableOnColorHex(backgroundHex: string, lightTextHex = '#f8fafc', darkTextHex = '#0f172a'): string {
    const clean = backgroundHex.replace('#', '');
    const normalized = clean.length === 3
        ? clean.split('').map((char) => char + char).join('')
        : clean;

    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);

    if ([r, g, b].some((value) => Number.isNaN(value))) {
        return lightTextHex;
    }

    // WCAG-inspired relative luminance approximation for quick foreground selection.
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.62 ? darkTextHex : lightTextHex;
}

export function ElementIcon({ element, size = 14, className = '', title }: IconProps & { element: string }) {
    const meta = getElementMeta(element);
    const tooltip = title ?? meta.label;

    switch (normalizeElementId(element)) {
        case 'red':
            return <IconFlame size={size} class={`text-red-500 ${className}`.trim()} title={tooltip} />;
        case 'blue':
            return <IconDroplets size={size} class={`text-sky-400 ${className}`.trim()} title={tooltip} />;
        case 'green':
            return <IconWind size={size} class={`text-emerald-400 ${className}`.trim()} title={tooltip} />;
        case 'yellow':
            return <IconBolt size={size} class={`text-amber-300 ${className}`.trim()} title={tooltip} />;
        case 'light':
            return <IconSun size={size} class={`text-slate-100 ${className}`.trim()} title={tooltip} />;
        case 'dark':
            return <IconMoon size={size} class={`text-slate-500 ${className}`.trim()} title={tooltip} />;
        case 'purple':
            return <IconBiohazard size={size} class={`text-fuchsia-400 ${className}`.trim()} title={tooltip} />;
        case 'orange':
            return <IconMountain size={size} class={`text-orange-400 ${className}`.trim()} title={tooltip} />;
        default:
            return <IconCircleFilled size={Math.max(10, size - 2)} class={`text-slate-300 ${className}`.trim()} title={tooltip} />;
    }
}

export function ElementBadge({ element }: { element: string }) {
    const meta = getElementMeta(element);

    return (
        <span class={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.badgeClass}`} title={meta.label}>
            <ElementIcon element={element} size={15} />
            <span>{meta.label}</span>
        </span>
    );
}

export function ClassIcon({ classType, size = 18, className = 'inline align-text-bottom', title }: IconProps & { classType: string }) {
    const meta = getClassMeta(classType);
    const tooltip = title ?? meta.label;

    switch (meta.iconKey) {
        case 'assassin':
            return <IconSword size={size} class={`text-rose-300 ${className}`.trim()} title={tooltip} />;
        case 'defender':
            return <IconShield size={size} class={`text-orange-400 ${className}`.trim()} title={tooltip} />;
        case 'caster':
            return <IconWand size={size} class={`text-cyan-300 ${className}`.trim()} title={tooltip} />;
        case 'controller':
            return <IconArrowsShuffle size={size} class={`text-amber-300 ${className}`.trim()} title={tooltip} />;
        default:
            return <IconShield size={size} class={`text-slate-300 ${className}`.trim()} title={tooltip} />;
    }
}
