import React from 'react';
import { Compass, Code2, GraduationCap, Zap } from 'lucide-react';
import useUiStore from '../../store/uiStore';
import styles from './ModeSwitcher.module.scss';

const modes = [
  { id: 'general', label: 'General', shortLabel: 'Gen', icon: Compass },
  { id: 'developer', label: 'Developer', shortLabel: 'Dev', icon: Code2 },
  { id: 'student', label: 'Student', shortLabel: 'Edu', icon: GraduationCap },
  { id: 'power-user', label: 'Power', shortLabel: 'Pwr', icon: Zap },
];

export default function ModeSwitcher({ isCollapsed = false }) {
  const { sidebarMode, setSidebarMode } = useUiStore();

  if (isCollapsed) {
    const activeMode = modes.find((m) => m.id === sidebarMode) || modes[0];
    const ActiveIcon = activeMode.icon;

    const handleCycle = () => {
      const currentIndex = modes.findIndex((m) => m.id === sidebarMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      setSidebarMode(modes[nextIndex].id);
    };

    return (
      <div className={styles.collapsedSwitcher}>
        <button
          type="button"
          onClick={handleCycle}
          className={`${styles.collapsedBtn} ${styles['collapsedBtn--active']}`}
          title={`Active Persona: ${activeMode.label} (Click to switch)`}
          aria-label={`Active Persona: ${activeMode.label}`}
        >
          <ActiveIcon size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={styles.switcher}>
      <span className={styles.label}>Mode Persona</span>
      <div className={styles.container} role="tablist" aria-label="Persona Mode">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = sidebarMode === mode.id;

          return (
            <button
              key={mode.id}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => setSidebarMode(mode.id)}
              className={`${styles.tab} ${isActive ? styles['tab--active'] : ''}`}
              title={`${mode.label} Mode`}
            >
              <Icon size={13} />
              <span className={styles.tabText}>{mode.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
