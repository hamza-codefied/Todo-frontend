import { Empty, Spin, Row, Col } from 'antd';
import { ProjectCard } from './ProjectCard';
import { Project } from '../../types';
import { FolderOpenOutlined } from '@ant-design/icons';

interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onClick: (project: Project) => void;
}

export function ProjectList({ projects, isLoading, onEdit, onDelete, onClick }: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="project-list-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="project-list-empty">
        <Empty
          image={<FolderOpenOutlined style={{ fontSize: 64, color: 'var(--text-secondary)' }} />}
          description="No projects yet. Create your first project to get started!"
        />
      </div>
    );
  }

  return (
    <Row gutter={[24, 24]} className="project-list">
      {projects.map((project) => (
        <Col xs={24} sm={12} lg={8} xl={6} key={project._id}>
          <ProjectCard
            project={project}
            onEdit={onEdit}
            onDelete={onDelete}
            onClick={onClick}
          />
        </Col>
      ))}
    </Row>
  );
}
