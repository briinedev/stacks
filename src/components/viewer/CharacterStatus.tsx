import CharacterEmulator, { CHAR_MAX_HP } from '../../utils/characterEmulator';
import styles from './CharacterStatus.module.css';

export default function Character({ char }: { char: CharacterEmulator }) {
    return (
        <div class={styles.Character}>
            <div class={styles.avatar}>
                <img src={`https://placehold.co/50x50/${char.primary}/${char.secondary}?text=${char.name}`} title={char.name} />
                <span title="BLUE" className={styles.element + ' ' + styles.elementLeft} style={{ backgroundColor: char.primary }} />
                <span title="RED" className={styles.element + ' ' + styles.elementRight} style={{ backgroundColor: char.secondary }} />
            </div>

            <div class={styles.stats}>
                <strong>{char.name} {char.defended ? '🛡️' : ''}</strong>
                <div>
                    <progress title={char.stamina.toString()} value={char.stamina} max={char.maxStamina} />
                </div>
                <div>
                    <progress title={char.hp.toString()} value={char.hp} max={CHAR_MAX_HP}>{char.hp.toString()}</progress>
                </div>
            </div>
        </div>
    );
}
