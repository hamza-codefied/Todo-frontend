import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { App, Button, Modal, Typography, Card, Breadcrumb, Spin, Space, Tag, Progress, Select, Checkbox } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, CalendarOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useTask, useUpdateTask, useDeleteTask, useToggleTask } from '../hooks/useTasks';
import { useTodos, useCreateTodo, useUpdateTodo, useDeleteTodo, useToggleTodo } from '../hooks/useTodos';
import { TodoList } from '../components/Todo/TodoList';
import { TodoForm } from '../components/Todo/TodoForm';
import { TaskForm } from '../components/Task/TaskForm';
import { Header } from '../components/Layout/Header';
import { Todo, TodoFormData, TaskFormData } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export function TaskDetail() {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: task, isLoading: taskLoading } = useTask(taskId || '');
  const { data: todos = [], isLoading: todosLoading } = useTodos({ task: taskId });
  
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const toggleTaskMutation = useToggleTask();
  const createTodoMutation = useCreateTodo();
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();
  const toggleTodoMutation = useToggleTodo();

  if (taskLoading) {
    return (
      <div className="task-detail-page">
        <Header />
        <main className="task-detail-main">
          <div className="loading-container">
            <Spin size="large" />
          </div>
        </main>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="task-detail-page">
        <Header />
        <main className="task-detail-main">
          <div className="not-found">
            <Title level={3}>Task not found</Title>
            <Button onClick={() => navigate(`/projects/${projectId}`)}>Back to Project</Button>
          </div>
        </main>
      </div>
    );
  }

  const handleUpdateTask = async (data: TaskFormData) => {
    try {
      await updateTaskMutation.mutateAsync({ id: task._id, data });
      message.success('Task updated successfully!');
      setShowTaskForm(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      message.error('Failed to update task');
    }
  };

  const handleDeleteTask = () => {
    modal.confirm({
      title: 'Delete Task',
      content: 'Are you sure? This will delete all todos in this task.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteTaskMutation.mutateAsync(task._id);
          message.success('Task deleted successfully!');
          navigate(`/projects/${projectId}`);
        } catch (error) {
          console.error('Failed to delete task:', error);
          message.error('Failed to delete task');
        }
      },
    });
  };

  const handleToggleTask = async () => {
    try {
      await toggleTaskMutation.mutateAsync(task._id);
      message.success(task.completed ? 'Task marked as pending' : 'Task marked as completed');
    } catch (error) {
      console.error('Failed to toggle task:', error);
      message.error('Failed to update task');
    }
  };

  const handleCreateTodo = async (data: TodoFormData) => {
    try {
      await createTodoMutation.mutateAsync(data);
      message.success('Todo created successfully!');
      setShowTodoForm(false);
    } catch (error) {
      console.error('Failed to create todo:', error);
      message.error('Failed to create todo');
    }
  };

  const handleUpdateTodo = async (data: TodoFormData) => {
    if (!editingTodo) return;
    try {
      await updateTodoMutation.mutateAsync({ id: editingTodo._id, data });
      message.success('Todo updated successfully!');
      setEditingTodo(null);
      setShowTodoForm(false);
    } catch (error) {
      console.error('Failed to update todo:', error);
      message.error('Failed to update todo');
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await deleteTodoMutation.mutateAsync(todoId);
      message.success('Todo deleted successfully!');
    } catch (error) {
      console.error('Failed to delete todo:', error);
      message.error('Failed to delete todo');
    }
  };

  const handleToggleTodo = async (todoId: string) => {
    try {
      await toggleTodoMutation.mutateAsync(todoId);
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      message.error('Failed to update todo');
    }
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setShowTodoForm(true);
  };

  const handleCloseTodoForm = () => {
    setShowTodoForm(false);
    setEditingTodo(null);
  };

  const isOverdue = dayjs(task.dueDate).isBefore(dayjs(), 'day') && !task.completed;
  const projectName = typeof task.project === 'object' ? task.project.name : 'Project';

  const formatEstimatedTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  // Filter todos based on status
  const filteredTodos = todos.filter(todo => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'completed') return todo.completed;
    if (statusFilter === 'pending') return !todo.completed;
    return true;
  });

  const completionPercent = task.totalTodos > 0 
    ? Math.round((task.completedTodos / task.totalTodos) * 100) 
    : 0;

  return (
    <div className="task-detail-page">
      <Header />
      
      <main className="task-detail-main">
        <Breadcrumb
          items={[
            { title: <a onClick={() => navigate('/projects')}>Projects</a> },
            { title: <a onClick={() => navigate(`/projects/${projectId}`)}>{projectName}</a> },
            { title: task.name },
          ]}
          style={{ marginBottom: 24 }}
        />

        <Card className="task-info-card">
          <div className="task-info-header">
            <div className="task-info-left">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(`/projects/${projectId}`)}
                style={{ marginRight: 16 }}
              >
                Back
              </Button>
              <Checkbox
                checked={task.completed}
                onChange={handleToggleTask}
                style={{ marginRight: 12 }}
              />
              <div>
                <Title 
                  level={3} 
                  style={{ 
                    margin: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12,
                    textDecoration: task.completed ? 'line-through' : 'none',
                    opacity: task.completed ? 0.7 : 1,
                  }}
                >
                  {task.name}
                  <Tag color={getPriorityColor(task.priority)}>{task.priority.toUpperCase()}</Tag>
                  <Tag icon={<AppstoreOutlined />} color="blue">{task.moduleName}</Tag>
                </Title>
                {task.description && (
                  <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                    {task.description}
                  </Text>
                )}
              </div>
            </div>
            <Space>
              <Button icon={<EditOutlined />} onClick={() => setShowTaskForm(true)}>
                Edit
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleDeleteTask}>
                Delete
              </Button>
            </Space>
          </div>

          <div className="task-info-stats">
            <Space size={24} wrap>
              <div className="task-stat">
                <CalendarOutlined />
                <Text type={isOverdue ? 'danger' : 'secondary'}>
                  Due: {dayjs(task.dueDate).format('MMMM DD, YYYY')}
                  {isOverdue && <span className="overdue-text"> (Overdue)</span>}
                </Text>
              </div>
              {task.totalEstimatedTime > 0 && (
                <div className="task-stat">
                  <ClockCircleOutlined />
                  <Text type="secondary">
                    Estimated: {formatEstimatedTime(task.totalEstimatedTime)}
                  </Text>
                </div>
              )}
              <div className="task-stat">
                <Progress
                  percent={completionPercent}
                  status={task.completed ? 'success' : isOverdue ? 'exception' : 'active'}
                  style={{ width: 150 }}
                  size="small"
                />
                <Text type="secondary">{task.completedTodos}/{task.totalTodos} todos</Text>
              </div>
            </Space>
          </div>
        </Card>

        <div className="todos-section">
          <div className="todos-header">
            <Title level={4} style={{ margin: 0 }}>Todos</Title>
            <Space>
              <Text strong>Status:</Text>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 140 }}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                ]}
              />
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setShowTodoForm(true)}
              >
                Add Todo
              </Button>
            </Space>
          </div>

          <TodoList
            todos={filteredTodos}
            isLoading={todosLoading}
            onToggle={handleToggleTodo}
            onEdit={handleEditTodo}
            onDelete={handleDeleteTodo}
          />
        </div>
      </main>

      <Modal
        title={editingTodo ? 'Edit Todo' : 'Create New Todo'}
        open={showTodoForm}
        onCancel={handleCloseTodoForm}
        footer={null}
        destroyOnClose
        width={500}
      >
        <TodoForm
          taskId={task._id}
          initialData={editingTodo || undefined}
          onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}
          onCancel={handleCloseTodoForm}
          isLoading={createTodoMutation.isPending || updateTodoMutation.isPending}
        />
      </Modal>

      <Modal
        title="Edit Task"
        open={showTaskForm}
        onCancel={() => setShowTaskForm(false)}
        footer={null}
        destroyOnClose
        width={500}
      >
        <TaskForm
          projectId={projectId || ''}
          initialData={task}
          onSubmit={handleUpdateTask}
          onCancel={() => setShowTaskForm(false)}
          isLoading={updateTaskMutation.isPending}
        />
      </Modal>
    </div>
  );
}
