import { Todo } from '../../types';
import { TodoCard } from './TodoCard';
import { Spin, Empty } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TodoList({ todos, isLoading, onToggle, onEdit, onDelete }: TodoListProps) {
  if (isLoading) {
    return (
      <div className="todo-list-loading">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="todo-list-empty">
        <Empty 
          description="No todos found. Create your first todo!"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <TodoCard
          key={todo._id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
