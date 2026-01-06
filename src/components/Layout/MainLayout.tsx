import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined, 
  ProjectOutlined, 
  UnorderedListOutlined, 
  CheckSquareOutlined,
  MenuOutlined,
  CloseOutlined,
  LogoutOutlined,
  UserOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons';
import { Switch, Typography } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { Text } = Typography;

interface SidebarProps {
  children: React.ReactNode;
}

interface NavItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
    path: '/dashboard',
  },
  {
    key: 'projects',
    icon: <ProjectOutlined />,
    label: 'Projects',
    path: '/projects',
  },
  {
    key: 'tasks',
    icon: <UnorderedListOutlined />,
    label: 'Tasks',
    path: '/tasks',
  },
  {
    key: 'todos',
    icon: <CheckSquareOutlined />,
    label: 'Todos',
    path: '/todos',
  },
];

export function MainLayout({ children }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const getActiveKey = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.startsWith('/projects')) return 'projects';
    if (path.startsWith('/tasks')) return 'tasks';
    if (path.startsWith('/todos')) return 'todos';
    return 'dashboard';
  };

  const activeKey = getActiveKey();

  return (
    <div className="main-layout">
      {/* Mobile Header */}
      {isMobile && (
        <header className="mobile-header">
          <button className="hamburger-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
          <div className="mobile-logo">
            <CheckSquareOutlined style={{ fontSize: 24 }} />
            <span>TodoManager</span>
          </div>
          <div className="mobile-header-right">
            <Switch 
              checked={isDark} 
              onChange={toggleTheme}
              size="small"
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
            />
          </div>
        </header>
      )}

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobile ? (isSidebarOpen ? 'sidebar-open' : 'sidebar-closed') : ''}`}>
        <div className="sidebar-content">
          {/* Logo */}
          {!isMobile && (
            <div className="sidebar-logo">
              <CheckSquareOutlined style={{ fontSize: 28 }} />
              <span>TodoManager</span>
            </div>
          )}

          {/* Navigation */}
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={`nav-item ${activeKey === item.key ? 'active' : ''}`}
                onClick={() => handleNavClick(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="sidebar-bottom">
            {/* Theme Toggle (Desktop only) */}
            {!isMobile && (
              <div className="theme-toggle">
                <SunOutlined style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#faad14' }} />
                <Switch 
                  checked={isDark} 
                  onChange={toggleTheme}
                  size="small"
                />
                <MoonOutlined style={{ color: isDark ? '#1890ff' : 'rgba(0,0,0,0.25)' }} />
              </div>
            )}

            {/* User Info */}
            <div className="sidebar-user">
              <div className="user-avatar">
                <UserOutlined />
              </div>
              <div className="user-info-text">
                <Text strong style={{ color: 'inherit' }}>{user?.name}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>{user?.email}</Text>
              </div>
            </div>

            {/* Logout */}
            <button className="logout-button" onClick={handleLogout}>
              <LogoutOutlined />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
