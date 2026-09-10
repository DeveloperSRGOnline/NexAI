import React from 'react';
import { Code2, Braces, Terminal, Network } from 'lucide-react';
import styles from './DevToolsPage.module.scss';

const devUtilities = [
  {
    title: 'Code Snippets Vault',
    desc: 'Syntax-highlighted code snippet storage with language tagging and instant search.',
    icon: Code2,
    phase: 'Phase 2',
  },
  {
    title: 'JSON Validator & Formatter',
    desc: 'Format, validate, repair, and inspect JSON payloads with tree-view inspection.',
    icon: Braces,
    phase: 'Phase 2',
  },
  {
    title: 'Regex Sandbox',
    desc: 'Interactive regular expression tester with live match highlighting and explanation.',
    icon: Terminal,
    phase: 'Phase 2',
  },
  {
    title: 'REST API Tester',
    desc: 'Lightweight in-browser HTTP client for probing external APIs and microservices.',
    icon: Network,
    phase: 'Phase 2',
  },
];

export default function DevToolsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Developer Utilities</h1>
        <p className={styles.subtitle}>
          Integrated engineering toolset designed for rapid debugging and code synthesis.
        </p>
      </header>

      <div className={styles.grid}>
        {devUtilities.map((tool) => {
          const Icon = tool.icon;
          return (
            <div key={tool.title} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <Icon size={20} />
                </div>
                <h3 className={styles.cardTitle}>{tool.title}</h3>
              </div>
              <p className={styles.cardDesc}>{tool.desc}</p>
              <span className={styles.badge}>{tool.phase}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

