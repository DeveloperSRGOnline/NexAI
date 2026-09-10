import React from 'react';
import { Plus, Sparkles, Code, BookOpen } from 'lucide-react';
import styles from './PromptsPage.module.scss';

const samplePrompts = [
  {
    title: 'Code Refactoring Review',
    icon: Code,
    text: 'Analyze the following {{language}} code for architectural patterns, performance bottlenecks, and security invariants: {{code}}',
  },
  {
    title: 'Socratic Concept Explainer',
    icon: BookOpen,
    text: 'Explain {{concept}} to a software engineer using progressive questions and concrete analogies.',
  },
];

export default function PromptsPage() {
  return (
    <div className={styles.prompts}>
      <div className={styles.prompts__header}>
        <div>
          <h2 className={styles.prompts__title}>Prompt Vault</h2>
          <p className={styles.prompts__description}>
            Store, tag, and execute reusable system prompts with variable interpolation (e.g. &#123;&#123;variable&#125;&#125;).
          </p>
        </div>
        <button className={styles.prompts__actionButton}>
          <Plus size={16} />
          <span>New Prompt</span>
        </button>
      </div>

      <div className={styles.prompts__grid}>
        {samplePrompts.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div key={idx} className={styles.prompts__card}>
              <div className={styles.prompts__cardHeader}>
                <Icon size={18} color="var(--color-accent)" />
                <h3 className={styles.prompts__cardTitle}>{p.title}</h3>
              </div>
              <p className={styles.prompts__cardContent}>{p.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
