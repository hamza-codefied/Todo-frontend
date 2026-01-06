import { Empty, Spin } from 'antd';
import { TaskCard } from './TaskCard';
import { Task } from '../../types';
import { UnorderedListOutlined } from '@ant-design/icons';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onClick: (task: Task) => void;
}

export function TaskList({ tasks, isLoading, onEdit, onDelete, onToggle, onClick }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="task-list-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <Empty
          image={<UnorderedListOutlined style={{ fontSize: 64, color: 'var(--text-secondary)' }} />}
          description="No tasks yet. Add your first task to get started!"
        />
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
          onClick={onClick}
        />
      ))}
    </div>
  );
}
