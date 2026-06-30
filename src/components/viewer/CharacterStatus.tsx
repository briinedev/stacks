import CharacterEmulator, { CHAR_MAX_HP } from '../../utils/characterEmulator';
import styles from './CharacterStatus.module.css';

function StatusBar({
    label,
    value,
    max,
    color,
    warningColor,
    dangerColor,
    displayValue,
}: {
    label: string;
    value: number;
    max: number;
    color: string;
    warningColor: string;
    dangerColor: string;
    displayValue: string;
}) {
    const percentage = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
    const fillColor = value < 0 ? dangerColor : value <= max * 0.3 ? warningColor : color;
    const barWidth = value < 0 ? 100 : percentage;

    return (
        <div class={styles.statRow}>
            <div class={styles.statLabel}>{label}</div>
            <div class={styles.statusBar}>
                <div class={styles.statValue}>{displayValue}</div>
                <div class={styles.statusBarFill} style={{ width: `${barWidth}%`, backgroundColor: fillColor }} />
            </div>
        </div>
    );
}

export default function Character({ char, onClick }: { char: CharacterEmulator, onClick: () => void }) {
    const staminaDisplay = `${char.stamina} / ${char.maxStamina}`;
    const hpDisplay = `${char.hp} / ${CHAR_MAX_HP}`;

    return (
        <div class={styles.Character} onClick={onClick}>
            <div class={styles.avatar}>
                <img src={`https://placehold.co/50x50/${char.primary}/${char.secondary}?text=${char.name}`} title={char.name} />
                <span title="BLUE" className={styles.element + ' ' + styles.elementLeft} style={{ backgroundColor: char.primary }} />
                <span title="RED" className={styles.element + ' ' + styles.elementRight} style={{ backgroundColor: char.secondary }} />
            </div>

            <div class={styles.stats}>
                <strong>{char.name} {char.defended ? '🛡️' : ''}</strong>
                <StatusBar
                    label="STA"
                    value={char.stamina}
                    max={char.maxStamina}
                    color="#facc15"
                    warningColor="#f59e0b"
                    dangerColor="#ef4444"
                    displayValue={staminaDisplay}
                />
                <StatusBar
                    label="HP"
                    value={char.hp}
                    max={CHAR_MAX_HP}
                    color="#22c55e"
                    warningColor="#f59e0b"
                    dangerColor="#ef4444"
                    displayValue={hpDisplay}
                />
            </div>
        </div>
    );
}
