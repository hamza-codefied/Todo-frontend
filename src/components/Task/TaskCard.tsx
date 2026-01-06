import { Card, Typography, Tag, Progress, Button, Popconfirm, Space, Tooltip, Checkbox } from 'antd';
import { EditOutlined, DeleteOutlined, CalendarOutlined, ClockCircleOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Task } from '../../types';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete, onToggle, onClick }: TaskCardProps) {
  const isOverdue = dayjs(task.dueDate).isBefore(dayjs(), 'day') && !task.completed;
  const daysLeft = dayjs(task.dueDate).diff(dayjs(), 'day');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getProgressPercent = () => {
    if (task.totalTodos === 0) return 0;
    return Math.round((task.completedTodos / task.totalTodos) * 100);
  };

  const formatEstimatedTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card
      className={`task-card ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
      hoverable
      onClick={() => onClick(task)}
    >
      <div className="task-card-content">
        <div className="task-checkbox" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={task.completed}
            onChange={() => onToggle(task._id)}
          />
        </div>

        <div className="task-main">
          <div className="task-header">
            <Title
              level={5}
              style={{
                margin: 0,
                flex: 1,
                textDecoration: task.completed ? 'line-through' : 'none',
                opacity: task.completed ? 0.6 : 1,
              }}
              ellipsis
            >
              {task.name}
            </Title>
            <Space size={4}>
              <Tag color={getPriorityColor(task.priority)}>{task.priority.toUpperCase()}</Tag>
              <Tag icon={<AppstoreOutlined />} color="blue">{task.moduleName}</Tag>
            </Space>
          </div>

          {task.description && (
            <Text
              type="secondary"
              className="task-description"
              style={{ opacity: task.completed ? 0.5 : 1 }}
            >
              {task.description}
            </Text>
          )}

          <div className="task-meta">
            <Space size={16} wrap>
              <span className={isOverdue ? 'text-danger' : ''}>
                <CalendarOutlined style={{ marginRight: 4 }} />
                <Text type={isOverdue ? 'danger' : 'secondary'}>
                  {dayjs(task.dueDate).format('MMM DD, YYYY')}
                  {!task.completed && daysLeft >= 0 && daysLeft <= 3 && (
                    <span className="days-warning"> ({daysLeft === 0 ? 'Today' : `${daysLeft}d left`})</span>
                  )}
                </Text>
              </span>
              {task.totalEstimatedTime > 0 && (
                <span>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  <Text type="secondary">{formatEstimatedTime(task.totalEstimatedTime)}</Text>
                </span>
              )}
            </Space>
          </div>

          {task.totalTodos > 0 && (
            <div className="task-progress">
              <div className="progress-header">
                <Text type="secondary" style={{ fontSize: 12 }}>Todos</Text>
                <Text style={{ fontSize: 12 }}>{task.completedTodos}/{task.totalTodos}</Text>
              </div>
              <Progress
                percent={getProgressPercent()}
                status={task.completed ? 'success' : isOverdue ? 'exception' : 'active'}
                size="small"
                showInfo={false}
              />
            </div>
          )}
        </div>

        <div className="task-actions" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => onEdit(task)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Task"
            description="Are you sure? This will delete all todos in this task."
            onConfirm={() => onDelete(task._id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      </div>
    </Card>
  );
}
