import { Todo } from '../../types';
import { Card, Tag, Button, Popconfirm, Typography, Space, Checkbox } from 'antd';
import { EditOutlined, DeleteOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface TodoCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TodoCard({ todo, onToggle, onEdit, onDelete }: TodoCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatEstimatedTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const isOverdue = !todo.completed && new Date(todo.dueDate) < new Date();

  const getPriorityColor = () => {
    switch (todo.priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  return (
    <Card 
      className={`todo-card ${todo.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
      size="small"
      hoverable
    >
      <div className="todo-card-content">
        <div className="todo-checkbox">
          <Checkbox 
            checked={todo.completed}
            onChange={() => onToggle(todo._id)}
          />
        </div>

        <div className="todo-main">
          <div className="todo-header">
            <Text 
              strong 
              delete={todo.completed}
              style={{ fontSize: 16 }}
            >
              {todo.title}
            </Text>
            <Tag color={getPriorityColor()}>
              {todo.priority}
            </Tag>
          </div>
          
          {todo.description && (
            <Text type="secondary" className="todo-description">
              {todo.description}
            </Text>
          )}

          <Space className="todo-meta" size="middle">
            <Text type={isOverdue ? 'danger' : 'secondary'}>
              <CalendarOutlined /> Due: {formatDate(todo.dueDate)}
            </Text>
            {todo.estimatedTime > 0 && (
              <Text type="secondary">
                <ClockCircleOutlined /> Est: {formatEstimatedTime(todo.estimatedTime)}
              </Text>
            )}
          </Space>
        </div>

        <div className="todo-actions">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(todo)}
            size="small"
          />
          <Popconfirm
            title="Delete Todo"
            description="Are you sure you want to delete this todo?"
            onConfirm={() => onDelete(todo._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              size="small"
            />
          </Popconfirm>
        </div>
      </div>
    </Card>
  );
}
