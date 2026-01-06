import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Input, Button, Typography, App } from 'antd';
import { MailOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';

  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);

    try {
      await login({ email: values.email, password: values.password });
      message.success('Login successful!');
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed. Please try again.';
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <LoginOutlined style={{ fontSize: 32 }} />
          </div>
          <Title level={2} style={{ margin: 0 }}>Welcome Back</Title>
          <Text type="secondary">Sign in to manage your todos</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="auth-form"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Enter your email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              block
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-footer">
          <Text>
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
          </Text>
        </div>
      </div>
    </div>
  );
}
