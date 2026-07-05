import React from 'react';
import { useProjectsStore, useUIStore } from '../store';

export default function Sidebar() {
  const { projects } = useProjectsStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  
  if (!sidebarOpen) return null;
  
  return (
    <aside className="sidebar">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-dark-300 uppercase tracking-wider mb-3">
          Projects
        </h3>
        <ul className="space-y-2">
          {projects.length === 0 ? (
            <li className="text-dark-500 text-sm italic">No projects yet</li>
          ) : (
            projects.map((project) => (
              <li
                key={project.id}
                className="px-3 py-2 rounded hover:bg-dark-700 cursor-pointer transition-colors"
              >
                {project.name}
              </li>
            ))
          )}
        </ul>
      </div>
      
      <div className="border-t border-dark-700 pt-4">
        <h3 className="text-sm font-bold text-dark-300 uppercase tracking-wider mb-3">
          Features
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="px-3 py-2 rounded hover:bg-dark-700 cursor-pointer transition-colors">
            📝 New Project
          </li>
          <li className="px-3 py-2 rounded hover:bg-dark-700 cursor-pointer transition-colors">
            🎤 Voice Mode
          </li>
          <li className="px-3 py-2 rounded hover:bg-dark-700 cursor-pointer transition-colors">
            ⭐ Favorites
          </li>
        </ul>
      </div>
    </aside>
  );
}
