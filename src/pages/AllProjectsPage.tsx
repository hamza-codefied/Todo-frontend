import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  App,
  Button,
  Modal,
  Typography,
  Card,
  Tag,
  Progress,
  Spin,
  Empty,
  Input,
  Select,
  Space,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  CalendarOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "../hooks/useProjects";
import { ProjectForm } from "../components/Project/ProjectForm";
import { Project, ProjectFormData, Task } from "../types";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

export function AllProjectsPage() {
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.getProjects,
  });

  // Fetch all tasks to show in project details
  const { data: allTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => taskService.getTasks(),
  });

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get tasks for a specific project
  const getProjectTasks = (projectId: string): Task[] => {
    return allTasks.filter((task) => {
      const taskProject =
        typeof task.project === "string" ? task.project : task.project?._id;
      return taskProject === projectId;
    });
  };

  const handleCreate = async (data: ProjectFormData) => {
    try {
      await createMutation.mutateAsync(data);
      message.success("Project created successfully!");
      setShowForm(false);
    } catch (error) {
      console.error("Failed to create project:", error);
      message.error("Failed to create project");
    }
  };

  const handleUpdate = async (data: ProjectFormData) => {
    if (!editingProject) return;
    try {
      await updateMutation.mutateAsync({ id: editingProject._id, data });
      message.success("Project updated successfully!");
      setEditingProject(null);
      setShowForm(false);
    } catch (error) {
      console.error("Failed to update project:", error);
      message.error("Failed to update project");
    }
  };

  const handleDelete = async (project: Project) => {
    modal.confirm({
      title: "Delete Project",
      content: `Are you sure you want to delete "${project.name}"? This will also delete all tasks and todos in this project.`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(project._id);
          message.success("Project deleted successfully!");
        } catch (error) {
          console.error("Failed to delete project:", error);
          message.error("Failed to delete project");
        }
      },
    });
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const toggleProjectExpand = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "processing";
      case "completed":
        return "success";
      case "on-hold":
        return "warning";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "green";
      default:
        return "default";
    }
  };

  const getDaysLeft = (eta: string) => {
    const now = dayjs();
    const etaDate = dayjs(eta);
    const diff = etaDate.diff(now, "day");
    return diff;
  };

  const isLoading = projectsLoading || tasksLoading;

  return (
    <div className="all-projects-page">
      <div className="page-header">
        <div className="page-title-section">
          <Title level={2} style={{ margin: 0 }}>
            All Projects
          </Title>
          <Text type="secondary">
            Manage all your projects with detailed task information
          </Text>
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

      {/* Filters */}
      <div className="page-filters">
        <Input
          placeholder="Search projects..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 250 }}
          allowClear
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 150 }}
          options={[
            { value: "all", label: "All Status" },
            { value: "active", label: "Active" },
            { value: "completed", label: "Completed" },
            { value: "on-hold", label: "On Hold" },
          ]}
        />
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="empty-container">
          <Empty
            description={
              searchTerm || statusFilter !== "all"
                ? "No projects match your filters"
                : "No projects yet"
            }
          />
          {!searchTerm && statusFilter === "all" && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowForm(true)}
            >
              Create Your First Project
            </Button>
          )}
        </div>
      ) : (
        <div className="projects-list">
          {filteredProjects.map((project) => {
            const projectTasks = getProjectTasks(project._id);
            const daysLeft = getDaysLeft(project.eta);
            const isOverdue = daysLeft < 0 && project.status !== "completed";
            const isExpanded = expandedProject === project._id;

            return (
              <Card
                key={project._id}
                className={`project-detail-card ${isOverdue ? "overdue" : ""} ${
                  isExpanded ? "expanded" : ""
                }`}
              >
                <div className="project-card-header">
                  <div className="project-card-left">
                    <div className="project-title-row">
                      <Title level={4} style={{ margin: 0 }}>
                        {project.name}
                      </Title>
                      <Tag color={getStatusColor(project.status)}>
                        {project.status.toUpperCase()}
                      </Tag>
                    </div>
                    {project.description && (
                      <Paragraph
                        type="secondary"
                        ellipsis={{ rows: 2 }}
                        style={{ margin: "8px 0 0" }}
                      >
                        {project.description}
                      </Paragraph>
                    )}
                  </div>
                  <div className="project-card-actions">
                    <Tooltip title="View Details">
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/projects/${project._id}`)}
                      />
                    </Tooltip>
                    <Tooltip title="Edit">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(project)}
                      />
                    </Tooltip>
                    <Tooltip title="Delete">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(project)}
                      />
                    </Tooltip>
                  </div>
                </div>

                <div className="project-meta-row">
                  <div className="meta-item">
                    <CalendarOutlined />
                    <Text type="secondary">
                      ETA: {dayjs(project.eta).format("MMM D, YYYY")}
                      {isOverdue && (
                        <span className="overdue-badge"> (Overdue)</span>
                      )}
                      {!isOverdue && daysLeft <= 7 && daysLeft >= 0 && (
                        <span className="warning-text">
                          {" "}
                          ({daysLeft} days left)
                        </span>
                      )}
                    </Text>
                  </div>
                  <div className="meta-item">
                    <UnorderedListOutlined />
                    <Text type="secondary">{project.totalTasks} Tasks</Text>
                  </div>
                  <div className="meta-item">
                    <CheckCircleOutlined />
                    <Text type="secondary">
                      {project.completedTasks} Completed
                    </Text>
                  </div>
                </div>

                <div className="project-progress-section">
                  <div className="progress-header">
                    <Text>Progress</Text>
                    <Text strong>{project.completionPercentage}%</Text>
                  </div>
                  <Progress
                    percent={project.completionPercentage}
                    showInfo={false}
                    strokeColor={
                      project.completionPercentage === 100
                        ? "#52c41a"
                        : "var(--primary-color)"
                    }
                    trailColor="var(--border-color)"
                  />
                </div>

                {/* Expandable Tasks Section */}
                <div className="project-tasks-section">
                  <Button
                    type="text"
                    onClick={() => toggleProjectExpand(project._id)}
                    className="expand-tasks-btn"
                  >
                    {isExpanded
                      ? "Hide Tasks"
                      : `Show Tasks (${projectTasks.length})`}
                  </Button>

                  {isExpanded && (
                    <div className="tasks-preview">
                      {projectTasks.length === 0 ? (
                        <Empty
                          description="No tasks in this project"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ) : (
                        <div className="tasks-grid">
                          {projectTasks.map((task) => (
                            <div key={task._id} className="task-preview-card">
                              <div className="task-preview-header">
                                <Text strong ellipsis style={{ maxWidth: 200 }}>
                                  {task.name}
                                </Text>
                                <Tag color={getPriorityColor(task.priority)}>
                                  {task.priority}
                                </Tag>
                              </div>
                              <div className="task-preview-meta">
                                <Tag>{task.moduleName}</Tag>
                                <Space size="small">
                                  <ClockCircleOutlined />
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    {dayjs(task.dueDate).format("MMM D")}
                                  </Text>
                                </Space>
                              </div>
                              <div className="task-preview-stats">
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Todos: {task.completedTodos}/{task.totalTodos}
                                </Text>
                                <Progress
                                  percent={
                                    task.totalTodos > 0
                                      ? (task.completedTodos /
                                          task.totalTodos) *
                                        100
                                      : 0
                                  }
                                  size="small"
                                  showInfo={false}
                                />
                              </div>
                              {task.completed && (
                                <Tag color="success" style={{ marginTop: 4 }}>
                                  Completed
                                </Tag>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Project Form Modal */}
      <Modal
        title={editingProject ? "Edit Project" : "Create New Project"}
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
