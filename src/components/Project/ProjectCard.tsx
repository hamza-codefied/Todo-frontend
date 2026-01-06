import { Card, Typography, Tag, Progress, Button, Popconfirm, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, CalendarOutlined, FolderOutlined } from '@ant-design/icons';
import { Project } from '../../types';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onClick: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete, onClick }: ProjectCardProps) {
  const isOverdue = dayjs(project.eta).isBefore(dayjs(), 'day') && project.status !== 'completed';
  const daysLeft = dayjs(project.eta).diff(dayjs(), 'day');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'processing';
      case 'completed': return 'success';
      case 'on-hold': return 'warning';
      default: return 'default';
    }
  };

  const getProgressStatus = () => {
    if (project.status === 'completed') return 'success';
    if (isOverdue) return 'exception';
    return 'active';
  };

  return (
    <Card
      className={`project-card ${isOverdue ? 'overdue' : ''}`}
      hoverable
      onClick={() => onClick(project)}
      actions={[
        <Tooltip title="Edit" key="edit">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project);
            }}
          />
        </Tooltip>,
        <Popconfirm
          key="delete"
          title="Delete Project"
          description="Are you sure? This will delete all tasks and todos in this project."
          onConfirm={(e) => {
            e?.stopPropagation();
            onDelete(project._id);
          }}
          onCancel={(e) => e?.stopPropagation()}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Tooltip>
        </Popconfirm>,
      ]}
    >
      <div className="project-card-content">
        <div className="project-header">
          <Title level={4} style={{ margin: 0, flex: 1 }} ellipsis>
            <FolderOutlined style={{ marginRight: 8, color: 'var(--primary-color)' }} />
            {project.name}
          </Title>
          <Tag color={getStatusColor(project.status)}>
            {project.status.replace('-', ' ').toUpperCase()}
          </Tag>
        </div>

        {project.description && (
          <Text type="secondary" className="project-description" ellipsis>
            {project.description}
          </Text>
        )}

        <div className="project-meta">
          <div className="project-eta">
            <CalendarOutlined style={{ marginRight: 4 }} />
            <Text type={isOverdue ? 'danger' : 'secondary'}>
              ETA: {dayjs(project.eta).format('MMM DD, YYYY')}
              {!isOverdue && daysLeft >= 0 && (
                <span className="days-left"> ({daysLeft} days left)</span>
              )}
              {isOverdue && <span className="overdue-text"> (Overdue)</span>}
            </Text>
          </div>
        </div>

        <div className="project-progress">
          <div className="progress-header">
            <Text type="secondary">Progress</Text>
            <Text strong>{project.completedTasks}/{project.totalTasks} tasks</Text>
          </div>
          <Progress
            percent={project.completionPercentage}
            status={getProgressStatus()}
            strokeColor={isOverdue && project.status !== 'completed' ? '#ff4d4f' : undefined}
            size="small"
          />
        </div>
      </div>
    </Card>
  );
}
