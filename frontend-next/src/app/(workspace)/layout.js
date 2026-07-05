'use client';

import { Layout } from '@/components/Layout';

/**
 * Workspace Layout — route group wrapper for all authenticated pages.
 * Provides the sidebar/header shell.
 */
export default function WorkspaceLayout({ children }) {
  return <Layout>{children}</Layout>;
}
