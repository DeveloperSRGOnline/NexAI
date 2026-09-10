import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import styles from './SecurityPage.module.scss';

export default function SecurityPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Secrets & Privacy Vault</h1>
        <p className={styles.subtitle}>
          Zero-knowledge client-side encryption via Web Crypto API (PBKDF2 + AES-GCM).
        </p>
      </header>

      <div className={styles.vaultLock}>
        <div className={styles.iconCircle}>
          <Lock size={32} />
        </div>
        <h2 className={styles.lockTitle}>Zero-Knowledge Encrypted Storage</h2>
        <p className={styles.lockDesc}>
          Your master key never touches the network. Plaintext data is encrypted directly inside your browser
          before transmission to MongoDB.
        </p>
        <span className={styles.badge}>Phase 3 • Full AES-GCM Pipeline</span>
      </div>
    </div>
  );
}

