import React from 'react';
import { Plus, BookOpen } from 'lucide-react';
import styles from './LibraryPage.module.scss';
import useLibraryStore from '../../store/libraryStore';

export default function LibraryPage() {
  const { items } = useLibraryStore();

  return (
    <div className={styles.library}>
      <div className={styles.library__header}>
        <div>
          <h2 className={styles.library__title}>Personal Knowledge Library</h2>
          <p className={styles.library__description}>
            Store web links, notes, and research papers with AI auto-tagging and vector search.
          </p>
        </div>
        <button className={styles.library__actionButton}>
          <Plus size={16} />
          <span>Save Item</span>
        </button>
      </div>

      <div className={styles.library__emptyState}>
        <BookOpen size={40} color="var(--text-tertiary)" />
        <h3 className={styles.library__emptyTitle}>Your library is empty</h3>
        <p className={styles.library__emptyText}>
          Save articles, URLs, or notes to index them into your personal Pinecone vector store for RAG chat.
        </p>
      </div>
    </div>
  );
}
