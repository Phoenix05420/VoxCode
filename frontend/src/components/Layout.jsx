import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export function Layout({ children, title = 'VoxCode', showSearch = true, onLogout }) {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  return (
    <div className="editorial-shell flex h-screen overflow-hidden bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] transition-colors duration-300">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col ml-64 overflow-hidden relative">
        <Header title={title} showSearch={showSearch} />
        <main className="flex-1 overflow-y-auto mt-16 p-4 md:p-8 relative z-10 transition-all">
          {children}
        </main>
      </div>
    </div>
  );
}
