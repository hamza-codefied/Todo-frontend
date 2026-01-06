import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Button, Switch, Space, Typography } from 'antd';
import { LogoutOutlined, CheckSquareOutlined, UserOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';

const { Text } = Typography;

export function Header() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <CheckSquareOutlined style={{ fontSize: 28 }} />
          <span>TodoManager</span>
        </div>

        <div className="header-actions">
          <Space size="middle" align="center">
            <Space size="small" align="center">
              <SunOutlined style={{ color: isDark ? 'rgba(255,255,255,0.45)' : '#faad14' }} />
              <Switch 
                checked={isDark} 
                onChange={toggleTheme}
                size="small"
              />
              <MoonOutlined style={{ color: isDark ? '#1890ff' : 'rgba(0,0,0,0.25)' }} />
            </Space>
            
            <div className="user-info">
              <UserOutlined />
              <Text style={{ color: 'inherit' }}>{user?.name}</Text>
            </div>
            
            <Button 
              type="text" 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </Button>
          </Space>
        </div>
      </div>
    </header>
  );
}
