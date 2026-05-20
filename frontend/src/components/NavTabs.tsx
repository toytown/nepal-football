import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/',        label: '📊 Overview',   end: true  },
  { to: '/tasks',    label: '✅ Task Board', end: false },
  { to: '/teams',    label: '👥 Teams',      end: false },
  { to: '/prep',     label: '🏗️ Prep Day',   end: false },
  { to: '/timeline', label: '📅 Timeline',   end: false },
];

export default function NavTabs() {
  return (
    <nav className="nav-tabs" aria-label="Primary">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `nav-tab${isActive ? ' active' : ''}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
