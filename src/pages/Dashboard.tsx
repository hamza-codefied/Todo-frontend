import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { todoService } from '../services/todoService';
import { Todo, DateFilter } from '../types';
import { TodoList } from '../components/Todo/TodoList';
import { TodoForm } from '../components/Todo/TodoForm';
import { DateFilterComponent } from '../components/Todo/DateFilter';
import { Header } from '../components/Layout/Header';
import { Button, Select, Modal, Card, Space, Typography, App } from 'antd';
import { PlusOutlined, ClearOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export function Dashboard() {
  const { user } = useAuth();
  const { message, modal } = App.useApp();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filters, setFilters] = useState<DateFilter>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchTodos = useCallback(async () => {
    setIsLoading(true);
    try {
      const filterParams: DateFilter & { completed?: boolean } = { ...filters };
      if (statusFilter === 'completed') filterParams.completed = true;
      if (statusFilter === 'pending') filterParams.completed = false;
      
      const data = await todoService.getTodos(filterParams);
      setTodos(data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
      message.error('Failed to load todos');
    } finally {
      setIsLoading(false);
    }
  }, [filters, statusFilter, message]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCreateTodo = async (data: { title: string; description?: string; dueDate: string; priority: 'low' | 'medium' | 'high' }) => {
    try {
      await todoService.createTodo(data);
      message.success('Todo created successfully!');
      setShowForm(false);
      fetchTodos();
    } catch (error) {
      console.error('Failed to create todo:', error);
      message.error('Failed to create todo');
    }
  };

  const handleUpdateTodo = async (data: { title: string; description?: string; dueDate: string; priority: 'low' | 'medium' | 'high' }) => {
    if (!editingTodo) return;
    try {
      await todoService.updateTodo(editingTodo._id, data);
      message.success('Todo updated successfully!');
      setEditingTodo(null);
      setShowForm(false);
      fetchTodos();
    } catch (error) {
      console.error('Failed to update todo:', error);
      message.error('Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await todoService.deleteTodo(id);
      message.success('Todo deleted successfully!');
      fetchTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
      message.error('Failed to delete todo');
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      await todoService.toggleTodo(id);
      fetchTodos();
    } catch (error) {
      console.error('Failed to toggle todo:', error);
      message.error('Failed to update todo status');
    }
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTodo(null);
  };

  const handleFilterChange = (newFilters: DateFilter) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setStatusFilter('all');
  };

  const hasActiveFilters = Object.values(filters).some(v => v) || statusFilter !== 'all';

  return (
    <div className="dashboard">
      <Header />
      
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div className="dashboard-welcome">
            <Title level={2} style={{ margin: 0 }}>Welcome, {user?.name}!</Title>
            <Text type="secondary">Manage your tasks and stay productive</Text>
          </div>
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setShowForm(true)}
          >
            Add Todo
          </Button>
        </div>

        <div className="dashboard-filters">
          <DateFilterComponent onFilterChange={handleFilterChange} filters={filters} />
          
          <div className="status-filter">
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
          </div>

          {hasActiveFilters && (
            <Button 
              type="text" 
              icon={<ClearOutlined />}
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>

        <div className="dashboard-stats">
          <Card className="stat-card" size="small">
            <div className="stat-content">
              <span className="stat-number">{todos.length}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
          </Card>
          <Card className="stat-card" size="small">
            <div className="stat-content">
              <span className="stat-number">{todos.filter(t => t.completed).length}</span>
              <span className="stat-label">Completed</span>
            </div>
          </Card>
          <Card className="stat-card" size="small">
            <div className="stat-content">
              <span className="stat-number">{todos.filter(t => !t.completed).length}</span>
              <span className="stat-label">Pending</span>
            </div>
          </Card>
        </div>

        <TodoList
          todos={todos}
          isLoading={isLoading}
          onToggle={handleToggleTodo}
          onEdit={handleEdit}
          onDelete={handleDeleteTodo}
        />
      </main>

      <Modal
        title={editingTodo ? 'Edit Todo' : 'Create New Todo'}
        open={showForm}
        onCancel={handleCloseForm}
        footer={null}
        destroyOnClose
        width={500}
      >
        <TodoForm
          initialData={editingTodo || undefined}
          onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}
          onCancel={handleCloseForm}
        />
      </Modal>
    </div>
  );
}
