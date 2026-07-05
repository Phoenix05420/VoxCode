'use client';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

/**
 * Layout — App shell that wraps Sidebar + Header + scrollable main content.
 * Props:
 *   - children: page content
 *   - title: displayed in the header bar
 */
export function Layout({ children, title }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <Header title={title} />
      <main className="main-content">
        <div className="p-6 lg:p-8 animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;
