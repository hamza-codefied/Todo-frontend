import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Input, Button, Typography, App } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, UserAddOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);

    try {
      await register({ name: values.name, email: values.email, password: values.password });
      message.success('Account created successfully!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.';
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
            <UserAddOutlined style={{ fontSize: 32 }} />
          </div>
          <Title level={2} style={{ margin: 0 }}>Create Account</Title>
          <Text type="secondary">Start organizing your tasks today</Text>
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
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: 'Please enter your name' },
              { min: 2, message: 'Name must be at least 2 characters' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter your name"
              autoComplete="name"
            />
          </Form.Item>

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
              { required: true, message: 'Please enter a password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Create a password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              block
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-footer">
          <Text>
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </Text>
        </div>
      </div>
    </div>
  );
}
