import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { App, Button, Modal, Typography, Card, Breadcrumb, Spin, Space, Tag, Progress, Select } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, CalendarOutlined, EditOutlined, DeleteOutlined, FolderOutlined } from '@ant-design/icons';
import { useProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useToggleTask } from '../hooks/useTasks';
import { TaskList } from '../components/Task/TaskList';
import { TaskForm } from '../components/Task/TaskForm';
import { ProjectForm } from '../components/Project/ProjectForm';
import { Header } from '../components/Layout/Header';
import { Task, TaskFormData, ProjectFormData } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: project, isLoading: projectLoading } = useProject(id || '');
  const { data: tasks = [], isLoading: tasksLoading } = useTasks({ project: id });
  
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const toggleTaskMutation = useToggleTask();

  if (projectLoading) {
    return (
      <div className="project-detail-page">
        <Header />
        <main className="project-detail-main">
          <div className="loading-container">
            <Spin size="large" />
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail-page">
        <Header />
        <main className="project-detail-main">
          <div className="not-found">
            <Title level={3}>Project not found</Title>
            <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
          </div>
        </main>
      </div>
    );
  }

  const handleUpdateProject = async (data: ProjectFormData) => {
    try {
      await updateProjectMutation.mutateAsync({ id: project._id, data });
      message.success('Project updated successfully!');
      setShowProjectForm(false);
    } catch (error) {
      console.error('Failed to update project:', error);
      message.error('Failed to update project');
    }
  };

  const handleDeleteProject = () => {
    modal.confirm({
      title: 'Delete Project',
      content: 'Are you sure? This will delete all tasks and todos in this project.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteProjectMutation.mutateAsync(project._id);
          message.success('Project deleted successfully!');
          navigate('/projects');
        } catch (error) {
          console.error('Failed to delete project:', error);
          message.error('Failed to delete project');
        }
      },
    });
  };

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      await createTaskMutation.mutateAsync(data);
      message.success('Task created successfully!');
      setShowTaskForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      message.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!editingTask) return;
    try {
      await updateTaskMutation.mutateAsync({ id: editingTask._id, data });
      message.success('Task updated successfully!');
      setEditingTask(null);
      setShowTaskForm(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      message.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      message.success('Task deleted successfully!');
    } catch (error) {
      console.error('Failed to delete task:', error);
      message.error('Failed to delete task');
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleTaskMutation.mutateAsync(taskId);
    } catch (error) {
      console.error('Failed to toggle task:', error);
      message.error('Failed to update task');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleClickTask = (task: Task) => {
    navigate(`/projects/${project._id}/tasks/${task._id}`);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const isOverdue = dayjs(project.eta).isBefore(dayjs(), 'day') && project.status !== 'completed';

  // Filter tasks based on status
  const filteredTasks = tasks.filter(task => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'completed') return task.completed;
    if (statusFilter === 'pending') return !task.completed;
    return true;
  });

  return (
    <div className="project-detail-page">
      <Header />
      
      <main className="project-detail-main">
        <Breadcrumb
          items={[
            { title: <a onClick={() => navigate('/projects')}>Projects</a> },
            { title: project.name },
          ]}
          style={{ marginBottom: 24 }}
        />

        <Card className="project-info-card">
          <div className="project-info-header">
            <div className="project-info-left">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/projects')}
                style={{ marginRight: 16 }}
              >
                Back
              </Button>
              <div>
                <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <FolderOutlined style={{ color: 'var(--primary-color)' }} />
                  {project.name}
                  <Tag color={project.status === 'active' ? 'processing' : project.status === 'completed' ? 'success' : 'warning'}>
                    {project.status.replace('-', ' ').toUpperCase()}
                  </Tag>
                </Title>
                {project.description && (
                  <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                    {project.description}
                  </Text>
                )}
              </div>
            </div>
            <Space>
              <Button icon={<EditOutlined />} onClick={() => setShowProjectForm(true)}>
                Edit
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleDeleteProject}>
                Delete
              </Button>
            </Space>
          </div>

          <div className="project-info-stats">
            <div className="project-stat">
              <CalendarOutlined />
              <Text type={isOverdue ? 'danger' : 'secondary'}>
                ETA: {dayjs(project.eta).format('MMMM DD, YYYY')}
                {isOverdue && <span className="overdue-text"> (Overdue)</span>}
              </Text>
            </div>
            <div className="project-stat">
              <Progress
                percent={project.completionPercentage}
                status={project.status === 'completed' ? 'success' : isOverdue ? 'exception' : 'active'}
                style={{ width: 200 }}
              />
              <Text type="secondary">{project.completedTasks}/{project.totalTasks} tasks completed</Text>
            </div>
          </div>
        </Card>

        <div className="tasks-section">
          <div className="tasks-header">
            <Title level={4} style={{ margin: 0 }}>Tasks</Title>
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
                onClick={() => setShowTaskForm(true)}
              >
                Add Task
              </Button>
            </Space>
          </div>

          <TaskList
            tasks={filteredTasks}
            isLoading={tasksLoading}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onToggle={handleToggleTask}
            onClick={handleClickTask}
          />
        </div>
      </main>

      <Modal
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        open={showTaskForm}
        onCancel={handleCloseTaskForm}
        footer={null}
        destroyOnClose
        width={500}
      >
        <TaskForm
          projectId={project._id}
          initialData={editingTask || undefined}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={handleCloseTaskForm}
          isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
        />
      </Modal>

      <Modal
        title="Edit Project"
        open={showProjectForm}
        onCancel={() => setShowProjectForm(false)}
        footer={null}
        destroyOnClose
        width={500}
      >
        <ProjectForm
          initialData={project}
          onSubmit={handleUpdateProject}
          onCancel={() => setShowProjectForm(false)}
          isLoading={updateProjectMutation.isPending}
        />
      </Modal>
    </div>
  );
}
