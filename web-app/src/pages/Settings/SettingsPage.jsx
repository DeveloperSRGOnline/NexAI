import React, { useState } from 'react';
import styles from './SettingsPage.module.scss';

export default function SettingsPage() {
  const [instructions, setInstructions] = useState(
    'You are NexAI, a concise and high-precision AI assistant. Always prioritize direct answers, rigorous logic, and clean code.'
  );

  return (
    <div className={styles.settings}>
      <div>
        <h2 className={styles.settings__title}>Workspace Settings</h2>
        <p className={styles.settings__description}>
          Configure global system behavior, AI instructions, and interface preferences.
        </p>
      </div>

      <div className={styles.settings__section}>
        <h3 className={styles.settings__sectionTitle}>Global System Instructions</h3>
        <p className={styles.settings__description}>
          These instructions are automatically prepended to every conversation across chat and document generation.
        </p>
        <div className={styles.settings__field}>
          <label htmlFor="globalInstructions" className={styles.settings__label}>
            AI Persona & Formatting Rules
          </label>
          <textarea
            id="globalInstructions"
            className={styles.settings__textarea}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>
        <button className={styles.settings__saveButton}>Save Preferences</button>
      </div>
    </div>
  );
}
