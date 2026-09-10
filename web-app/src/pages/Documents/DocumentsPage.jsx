import React from 'react';
import { FileText, Wand2 } from 'lucide-react';
import styles from './DocumentsPage.module.scss';
import useDocumentStore from '../../store/documentStore';

export default function DocumentsPage() {
  const { documents } = useDocumentStore();

  return (
    <div className={styles.documents}>
      <div className={styles.documents__header}>
        <div>
          <h2 className={styles.documents__title}>AI Document Studio</h2>
          <p className={styles.documents__description}>
            Generate structured multi-section reports with Gemini 2.5 Pro, Tiptap editing, and pure JS PDF/DOCX exports.
          </p>
        </div>
        <button className={styles.documents__actionButton}>
          <Wand2 size={16} />
          <span>New AI Document</span>
        </button>
      </div>

      <div className={styles.documents__card}>
        <FileText size={48} color="var(--color-accent)" />
        <h3 className={styles.documents__cardTitle}>Start a structured document</h3>
        <p className={styles.documents__cardText}>
          Describe what you want to write. NexAI will generate sections, research citations, and format clean PDF/DOCX downloads without heavy headless browsers.
        </p>
      </div>
    </div>
  );
}
