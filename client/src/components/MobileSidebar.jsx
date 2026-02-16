import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  CalendarCheck,
  BarChart3,
  User,
} from 'lucide-react';

/** Mobile bottom navigation – shown only on small screens */
const navItems = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/create-plan', label: 'Create', icon: PlusCircle },
  { to: '/plans', label: 'Plans', icon: FolderOpen },
  { to: '/daily', label: 'Daily', icon: CalendarCheck },
  { to: '/analytics', label: 'Stats', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function MobileSidebar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-[10px] font-medium ${
                isActive ? 'text-indigo-600' : 'text-gray-500'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
