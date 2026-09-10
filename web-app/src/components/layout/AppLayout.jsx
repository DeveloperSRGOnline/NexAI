import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  BookOpen,
  FileText,
  Sparkles,
  Settings,
  Cpu,
  LogOut
} from 'lucide-react';
import styles from './AppLayout.module.scss';
import useUiStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

const navItems = [
  { path: '/chat', label: 'Chat', icon: MessageSquare },
  { path: '/library', label: 'Knowledge Library', icon: BookOpen },
  { path: '/documents', label: 'Document Studio', icon: FileText },
  { path: '/prompts', label: 'Prompt Vault', icon: Sparkles },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen } = useUiStore();
  const { user, logout } = useAuthStore();

  const getPageTitle = () => {
    const activeItem = navItems.find(
      (item) => location.pathname === item.path || (item.path === '/chat' && location.pathname === '/')
    );
    return activeItem ? activeItem.label : 'Workspace';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className={styles.layout}>
      <aside
        className={`${styles.layout__sidebar} ${sidebarOpen ? styles['layout__sidebar--open'] : ''
          }`}
      >
        <div className={styles.layout__brand}>
          <img src="/favicon.svg" alt="NexAI Logo" className={styles.layout__logo} />
          <span className={styles.layout__brandName}>NexAI</span>
        </div>

        <nav className={styles.layout__nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === '/chat' && location.pathname === '/');
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`${styles.layout__navItem} ${isActive ? styles['layout__navItem--active'] : ''
                  }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {user && (
          <div className={styles.layout__userSection}>
            <div className={styles.layout__userProfile}>
              <div className={styles.layout__userAvatar}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || 'User Avatar'} />
                ) : (
                  userInitial
                )}
              </div>
              <div className={styles.layout__userInfo}>
                <span className={styles.layout__userName}>{user.name || 'User'}</span>
                <span className={styles.layout__userEmail}>{user.email || ''}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className={styles.layout__logoutBtn}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}

        <div className={styles.layout__footer}>
          <div className={styles.layout__status}>
            <span className={styles.layout__statusDot} />
            <span>Gemini 2.0 Ready</span>
          </div>
          <Cpu size={16} color="var(--text-tertiary)" />
        </div>
      </aside>

      <div className={styles.layout__main}>
        <header className={styles.layout__header}>
          <h1 className={styles.layout__headerTitle}>{getPageTitle()}</h1>
        </header>

        <main className={styles.layout__content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
