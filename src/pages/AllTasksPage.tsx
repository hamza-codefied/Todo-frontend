import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  App, Button, Modal, Typography, Card, Tag, Progress, 
  Spin, Empty, Input, Select, Space, Tooltip, Checkbox
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  CalendarOutlined,
  FolderOutlined,
  CheckSquareOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Task, TaskFormData, Todo } from '../types';
import { taskService } from '../services/taskService';
import { todoService } from '../services/todoService';
import { projectService } from '../services/projectService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskForm } from '../components/Task/TaskForm';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export function AllTasksPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message, modal } = App.useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.getTasks(),
  });

  // Fetch projects for filter
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  });

  // Fetch all todos
  const { data: allTodos = [], isLoading: todosLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: () => todoService.getTodos(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: TaskFormData) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskFormData> }) => 
      taskService.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => taskService.toggleTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.moduleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'completed' ? task.completed : !task.completed);
    
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    const taskProjectId = typeof task.project === 'string' ? task.project : task.project?._id;
    const matchesProject = projectFilter === 'all' || taskProjectId === projectFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  // Get todos for a specific task
  const getTaskTodos = (taskId: string): Todo[] => {
    return allTodos.filter(todo => {
      const todoTask = typeof todo.task === 'string' ? todo.task : todo.task?._id;
      return todoTask === taskId;
    });
  };

  const handleCreate = async (data: TaskFormData) => {
    try {
      await createMutation.mutateAsync(data);
      message.success('Task created successfully!');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      message.error('Failed to create task');
    }
  };

  const handleUpdate = async (data: TaskFormData) => {
    if (!editingTask) return;
    try {
      await updateMutation.mutateAsync({ id: editingTask._id, data });
      message.success('Task updated successfully!');
      setEditingTask(null);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      message.error('Failed to update task');
    }
  };

  const handleDelete = async (task: Task) => {
    modal.confirm({
      title: 'Delete Task',
      content: `Are you sure you want to delete "${task.name}"? This will also delete all todos in this task.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(task._id);
          message.success('Task deleted successfully!');
        } catch (error) {
          console.error('Failed to delete task:', error);
          message.error('Failed to delete task');
        }
      },
    });
  };

  const handleToggle = async (task: Task) => {
    try {
      await toggleMutation.mutateAsync(task._id);
      message.success(task.completed ? 'Task marked as pending' : 'Task completed!');
    } catch (error) {
      console.error('Failed to toggle task:', error);
      message.error('Failed to update task');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getDaysLeft = (dueDate: string) => {
    const now = dayjs();
    const due = dayjs(dueDate);
    const diff = due.diff(now, 'day');
    return diff;
  };

  const getProjectName = (task: Task): string => {
    if (typeof task.project === 'string') {
      const project = projects.find(p => p._id === task.project);
      return project?.name || 'Unknown Project';
    }
    return task.project?.name || 'Unknown Project';
  };

  const getProjectId = (task: Task): string => {
    if (typeof task.project === 'string') {
      return task.project;
    }
    return task.project?._id || '';
  };

  const isLoading = tasksLoading || todosLoading;

  return (
    <div className="all-tasks-page">
      <div className="page-header">
        <div className="page-title-section">
          <Title level={2} style={{ margin: 0 }}>All Tasks</Title>
          <Text type="secondary">Manage all tasks across your projects</Text>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setShowForm(true)}
        >
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="page-filters">
        <Input
          placeholder="Search tasks..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 220 }}
          allowClear
        />
        <Select
          value={projectFilter}
          onChange={setProjectFilter}
          style={{ width: 180 }}
          options={[
            { value: 'all', label: 'All Projects' },
            ...projects.map(p => ({ value: p._id, label: p.name })),
          ]}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 130 }}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Completed' },
          ]}
        />
        <Select
          value={priorityFilter}
          onChange={setPriorityFilter}
          style={{ width: 130 }}
          options={[
            { value: 'all', label: 'All Priority' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ]}
        />
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-container">
          <Empty 
            description={searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all' 
              ? 'No tasks match your filters' 
              : 'No tasks yet'} 
          />
          {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && projectFilter === 'all' && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowForm(true)}>
              Create Your First Task
            </Button>
          )}
        </div>
      ) : (
        <div className="tasks-list">
          {filteredTasks.map((task) => {
            const taskTodos = getTaskTodos(task._id);
            const daysLeft = getDaysLeft(task.dueDate);
            const isOverdue = daysLeft < 0 && !task.completed;
            const isExpanded = expandedTask === task._id;

            return (
              <Card 
                key={task._id} 
                className={`task-detail-card ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`}
              >
                <div className="task-card-content">
                  <div className="task-checkbox-column">
                    <Checkbox 
                      checked={task.completed}
                      onChange={() => handleToggle(task)}
                    />
                  </div>
                  
                  <div className="task-main-content">
                    <div className="task-card-header">
                      <div className="task-title-row">
                        <Title 
                          level={5} 
                          style={{ margin: 0, textDecoration: task.completed ? 'line-through' : 'none' }}
                        >
                          {task.name}
                        </Title>
                        <Space>
                          <Tag color={getPriorityColor(task.priority)}>{task.priority}</Tag>
                          <Tag>{task.moduleName}</Tag>
                          {task.completed && <Tag color="success">Completed</Tag>}
                        </Space>
                      </div>
                      {task.description && (
                        <Paragraph 
                          type="secondary" 
                          ellipsis={{ rows: 2 }} 
                          style={{ margin: '8px 0 0', textDecoration: task.completed ? 'line-through' : 'none' }}
                        >
                          {task.description}
                        </Paragraph>
                      )}
                    </div>

                    <div className="task-meta-row">
                      <div className="meta-item" style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${getProjectId(task)}`)}>
                        <FolderOutlined />
                        <Text type="secondary">{getProjectName(task)}</Text>
                      </div>
                      <div className="meta-item">
                        <CalendarOutlined />
                        <Text type="secondary">
                          Due: {dayjs(task.dueDate).format('MMM D, YYYY')}
                          {isOverdue && <span className="overdue-badge"> (Overdue)</span>}
                          {!isOverdue && daysLeft <= 3 && daysLeft >= 0 && (
                            <span className="warning-text"> ({daysLeft} days left)</span>
                          )}
                        </Text>
                      </div>
                      <div className="meta-item">
                        <CheckSquareOutlined />
                        <Text type="secondary">{task.completedTodos}/{task.totalTodos} Todos</Text>
                      </div>
                      {task.totalEstimatedTime > 0 && (
                        <div className="meta-item">
                          <ClockCircleOutlined />
                          <Text type="secondary">{task.totalEstimatedTime}h estimated</Text>
                        </div>
                      )}
                    </div>

                    {task.totalTodos > 0 && (
                      <div className="task-progress-section">
                        <Progress 
                          percent={Math.round((task.completedTodos / task.totalTodos) * 100)} 
                          size="small"
                          strokeColor={task.completedTodos === task.totalTodos ? '#52c41a' : 'var(--primary-color)'}
                          trailColor="var(--border-color)"
                        />
                      </div>
                    )}

                    {/* Expandable Todos Section */}
                    <div className="task-todos-section">
                      <Button 
                        type="text" 
                        size="small"
                        onClick={() => toggleTaskExpand(task._id)}
                        className="expand-todos-btn"
                      >
                        {isExpanded ? 'Hide Todos' : `Show Todos (${taskTodos.length})`}
                      </Button>

                      {isExpanded && (
                        <div className="todos-preview">
                          {taskTodos.length === 0 ? (
                            <Empty description="No todos in this task" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          ) : (
                            <div className="todos-grid">
                              {taskTodos.map((todo) => (
                                <div 
                                  key={todo._id} 
                                  className={`todo-preview-card ${todo.completed ? 'completed' : ''}`}
                                >
                                  <div className="todo-preview-header">
                                    <Checkbox checked={todo.completed} disabled />
                                    <Text 
                                      ellipsis 
                                      style={{ 
                                        textDecoration: todo.completed ? 'line-through' : 'none',
                                        flex: 1 
                                      }}
                                    >
                                      {todo.title}
                                    </Text>
                                    <Tag color={getPriorityColor(todo.priority)} style={{ marginLeft: 8 }}>
                                      {todo.priority}
                                    </Tag>
                                  </div>
                                  <div className="todo-preview-meta">
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      Due: {dayjs(todo.dueDate).format('MMM D')}
                                    </Text>
                                    {todo.estimatedTime > 0 && (
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        • {todo.estimatedTime}h
                                      </Text>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="task-card-actions">
                    <Tooltip title="View Details">
                      <Button 
                        type="text" 
                        icon={<EyeOutlined />} 
                        onClick={() => navigate(`/projects/${getProjectId(task)}/tasks/${task._id}`)}
                      />
                    </Tooltip>
                    <Tooltip title="Edit">
                      <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(task)} />
                    </Tooltip>
                    <Tooltip title="Delete">
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(task)} />
                    </Tooltip>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Task Form Modal */}
      <Modal
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        open={showForm}
        onCancel={handleCloseForm}
        footer={null}
        destroyOnClose
        width={500}
      >
        <TaskForm
          initialData={editingTask || undefined}
          projects={projects}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onCancel={handleCloseForm}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
}
