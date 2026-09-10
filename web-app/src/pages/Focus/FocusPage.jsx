import React from 'react';
import { Layers, Youtube, Clock, CheckCircle2 } from 'lucide-react';
import styles from './FocusPage.module.scss';

const studentTools = [
  {
    title: 'AI Flashcards & Spaced Repetition',
    desc: 'Generate interactive flashcard decks from library notes and test recall retention.',
    icon: Layers,
    phase: 'Phase 2',
  },
  {
    title: 'YouTube Video Summarizer',
    desc: 'Extract key insights, chapters, and synthesis from technical lectures and tutorials.',
    icon: Youtube,
    phase: 'Phase 2',
  },
  {
    title: 'Focus Sessions & Reminders',
    desc: 'Pomodoro timer with quiet-hours coordination and browser notification dispatch.',
    icon: Clock,
    phase: 'Phase 2',
  },
  {
    title: 'Study Goal Tracker',
    desc: 'Structured study plans with progressive milestone checklists.',
    icon: CheckCircle2,
    phase: 'Phase 2',
  },
];

export default function FocusPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Learning & Focus Suite</h1>
        <p className={styles.subtitle}>
          Cognitive reinforcement and study tools optimized for deep knowledge retention.
        </p>
      </header>

      <div className={styles.grid}>
        {studentTools.map((tool) => {
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

