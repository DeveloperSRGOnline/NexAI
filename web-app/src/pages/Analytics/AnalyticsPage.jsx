import React from 'react';
import styles from './AnalyticsPage.module.scss';

export default function AnalyticsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>System & Productivity Analytics</h1>
        <p className={styles.subtitle}>
          Usage metrics, AI token consumption, RAG indexing rate, and query distribution.
        </p>
      </header>

      <div className={styles.grid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>100%</span>
          <span className={styles.statLabel}>Free-Tier Safety Index</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>0 ms</span>
          <span className={styles.statLabel}>Avg Latency</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>0</span>
          <span className={styles.statLabel}>Vector Embeddings</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>0</span>
          <span className={styles.statLabel}>Chats Recorded</span>
        </div>
      </div>

      <div className={styles.infoBanner}>
        Interactive charts, RAG retrieval heatmaps, and hourly synthesis breakdowns will activate in Phase 3.
      </div>
    </div>
  );
}
