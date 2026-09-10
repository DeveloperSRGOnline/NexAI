import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import styles from './ChatPage.module.scss';
import useChatStore from '../../store/chatStore';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const { messages } = useChatStore();

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setInput('');
  };

  return (
    <div className={styles.chat}>
      <div className={styles.chat__hero}>
        <div className={styles.chat__badge}>
          <Sparkles size={14} />
          <span>Gemini 2.0 Flash</span>
        </div>
        <h2 className={styles.chat__title}>How can NexAI assist you today?</h2>
        <p className={styles.chat__subtitle}>
          Ask anything, search your personal library, or generate comprehensive structured documents.
        </p>
      </div>

      <form className={styles.chat__inputStub} onSubmit={handleSend}>
        <input
          type="text"
          className={styles.chat__input}
          placeholder="Message NexAI or ask about your library..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className={styles.chat__sendButton} aria-label="Send message">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
