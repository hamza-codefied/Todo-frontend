import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App, Button, Modal, Typography, Card, Row, Col } from 'antd';
import { PlusOutlined, FolderOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import { ProjectList } from '../components/Project/ProjectList';
import { ProjectForm } from '../components/Project/ProjectForm';
import { Header } from '../components/Layout/Header';
import { Project, ProjectFormData } from '../types';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export function Projects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { message } = App.useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { data: projects = [], isLoading } = useProjects();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const handleCreate = async (data: ProjectFormData) => {
    try {
      await createMutation.mutateAsync(data);
      message.success('Project created successfully!');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      message.error('Failed to create project');
    }
  };

  const handleUpdate = async (data: ProjectFormData) => {
    if (!editingProject) return;
    try {
      await updateMutation.mutateAsync({ id: editingProject._id, data });
      message.success('Project updated successfully!');
      setEditingProject(null);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to update project:', error);
      message.error('Failed to update project');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Project deleted successfully!');
    } catch (error) {
      console.error('Failed to delete project:', error);
      message.error('Failed to delete project');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleClick = (project: Project) => {
    navigate(`/projects/${project._id}`);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  // Calculate stats
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalTasks = projects.reduce((sum, p) => sum + p.totalTasks, 0);

  return (
    <div className="projects-page">
      <Header />
      
      <main className="projects-main">
        <div className="projects-header">
          <div className="projects-welcome">
            <Title level={2} style={{ margin: 0 }}>Welcome back, {user?.name}!</Title>
            <Text type="secondary">Manage your projects and stay on track</Text>
          </div>
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setShowForm(true)}
          >
            New Project
          </Button>
        </div>

        <div className="projects-stats">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card className="stat-card" size="small">
                <div className="stat-content">
                  <FolderOutlined style={{ fontSize: 24, color: 'var(--primary-color)', marginBottom: 8 }} />
                  <span className="stat-number">{projects.length}</span>
                  <span className="stat-label">Total Projects</span>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="stat-card" size="small">
                <div className="stat-content">
                  <ClockCircleOutlined style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }} />
                  <span className="stat-number">{activeProjects}</span>
                  <span className="stat-label">Active Projects</span>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className="stat-card" size="small">
                <div className="stat-content">
                  <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a', marginBottom: 8 }} />
                  <span className="stat-number">{totalTasks}</span>
                  <span className="stat-label">Total Tasks</span>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        <div className="projects-section">
          <Title level={4} style={{ marginBottom: 16 }}>Your Projects</Title>
          <ProjectList
            projects={projects}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClick={handleClick}
          />
        </div>
      </main>

      <Modal
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        open={showForm}
        onCancel={handleCloseForm}
        footer={null}
        destroyOnClose
        width={500}
      >
        <ProjectForm
          initialData={editingProject || undefined}
          onSubmit={editingProject ? handleUpdate : handleCreate}
          onCancel={handleCloseForm}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
}
