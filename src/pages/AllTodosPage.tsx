import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Modal,
  Typography,
  Card,
  Tag,
  Spin,
  Empty,
  Input,
  Select,
  Checkbox,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  CalendarOutlined,
  FolderOutlined,
  UnorderedListOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Todo, TodoFormData } from "../types";
import { todoService } from "../services/todoService";
import { taskService } from "../services/taskService";
import { projectService } from "../services/projectService";
import { TodoForm } from "../components/Todo/TodoForm";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

export function AllTodosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { message, modal } = App.useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [taskFilter, setTaskFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  // Fetch todos
  const { data: todos = [], isLoading: todosLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: () => todoService.getTodos(),
  });

  // Fetch tasks for filter
  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => taskService.getTasks(),
  });

  // Fetch projects for filter
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.getProjects,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: TodoFormData) => todoService.createTodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TodoFormData> }) =>
      todoService.updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => todoService.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => todoService.toggleTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Helper to get task info
  const getTaskInfo = (
    todo: Todo
  ): { id: string; name: string; moduleName: string } => {
    if (typeof todo.task === "string") {
      const task = tasks.find((t) => t._id === todo.task);
      return {
        id: todo.task,
        name: task?.name || "Unknown Task",
        moduleName: task?.moduleName || "N/A",
      };
    }
    return {
      id: todo.task?._id || "",
      name: todo.task?.name || "Unknown Task",
      moduleName: todo.task?.moduleName || "N/A",
    };
  };

  // Helper to get project info from task
  const getProjectInfo = (todo: Todo): { id: string; name: string } => {
    const taskInfo = getTaskInfo(todo);
    const task = tasks.find((t) => t._id === taskInfo.id);
    if (!task) return { id: "", name: "Unknown Project" };

    if (typeof task.project === "string") {
      const project = projects.find((p) => p._id === task.project);
      return { id: task.project, name: project?.name || "Unknown Project" };
    }
    return {
      id: task.project?._id || "",
      name: task.project?.name || "Unknown Project",
    };
  };

  // Filter todos
  const filteredTodos = todos.filter((todo) => {
    const matchesSearch =
      todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" ? todo.completed : !todo.completed);

    const matchesPriority =
      priorityFilter === "all" || todo.priority === priorityFilter;

    const todoTaskId =
      typeof todo.task === "string" ? todo.task : todo.task?._id;
    const matchesTask = taskFilter === "all" || todoTaskId === taskFilter;

    // For project filter, we need to check the parent task's project
    let matchesProject = projectFilter === "all";
    if (!matchesProject && todoTaskId) {
      const task = tasks.find((t) => t._id === todoTaskId);
      if (task) {
        const taskProjectId =
          typeof task.project === "string" ? task.project : task.project?._id;
        matchesProject = taskProjectId === projectFilter;
      }
    }

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesTask &&
      matchesProject
    );
  });

  // Filter tasks based on selected project
  const filteredTasksForSelect =
    projectFilter === "all"
      ? tasks
      : tasks.filter((task) => {
          const taskProjectId =
            typeof task.project === "string" ? task.project : task.project?._id;
          return taskProjectId === projectFilter;
        });

  const handleCreate = async (data: TodoFormData) => {
    try {
      await createMutation.mutateAsync(data);
      message.success("Todo created successfully!");
      setShowForm(false);
    } catch (error) {
      console.error("Failed to create todo:", error);
      message.error("Failed to create todo");
    }
  };

  const handleUpdate = async (data: TodoFormData) => {
    if (!editingTodo) return;
    try {
      await updateMutation.mutateAsync({ id: editingTodo._id, data });
      message.success("Todo updated successfully!");
      setEditingTodo(null);
      setShowForm(false);
    } catch (error) {
      console.error("Failed to update todo:", error);
      message.error("Failed to update todo");
    }
  };

  const handleDelete = async (todo: Todo) => {
    modal.confirm({
      title: "Delete Todo",
      content: `Are you sure you want to delete "${todo.title}"?`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(todo._id);
          message.success("Todo deleted successfully!");
        } catch (error) {
          console.error("Failed to delete todo:", error);
          message.error("Failed to delete todo");
        }
      },
    });
  };

  const handleToggle = async (todo: Todo) => {
    try {
      await toggleMutation.mutateAsync(todo._id);
      message.success(
        todo.completed ? "Todo marked as pending" : "Todo completed!"
      );
    } catch (error) {
      console.error("Failed to toggle todo:", error);
      message.error("Failed to update todo");
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

  const getDaysLeft = (dueDate: string) => {
    const now = dayjs();
    const due = dayjs(dueDate);
    const diff = due.diff(now, "day");
    return diff;
  };

  return (
    <div className="all-todos-page">
      <div className="page-header">
        <div className="page-title-section">
          <Title level={2} style={{ margin: 0 }}>
            All Todos
          </Title>
          <Text type="secondary">
            Manage all your todos across tasks and projects
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setShowForm(true)}
          disabled={tasks.length === 0}
        >
          New Todo
        </Button>
      </div>

      {/* Filters */}
      <div className="page-filters">
        <Input
          placeholder="Search todos..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        <Select
          value={projectFilter}
          onChange={(val) => {
            setProjectFilter(val);
            setTaskFilter("all"); // Reset task filter when project changes
          }}
          style={{ width: 160 }}
          options={[
            { value: "all", label: "All Projects" },
            ...projects.map((p) => ({ value: p._id, label: p.name })),
          ]}
        />
        <Select
          value={taskFilter}
          onChange={setTaskFilter}
          style={{ width: 160 }}
          options={[
            { value: "all", label: "All Tasks" },
            ...filteredTasksForSelect.map((t) => ({
              value: t._id,
              label: t.name,
            })),
          ]}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 120 }}
          options={[
            { value: "all", label: "All Status" },
            { value: "pending", label: "Pending" },
            { value: "completed", label: "Completed" },
          ]}
        />
        <Select
          value={priorityFilter}
          onChange={setPriorityFilter}
          style={{ width: 120 }}
          options={[
            { value: "all", label: "All Priority" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ]}
        />
      </div>

      {/* Todos List */}
      {todosLoading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : filteredTodos.length === 0 ? (
        <div className="empty-container">
          <Empty
            description={
              tasks.length === 0
                ? "Create a task first to add todos"
                : searchTerm ||
                  statusFilter !== "all" ||
                  priorityFilter !== "all" ||
                  taskFilter !== "all" ||
                  projectFilter !== "all"
                ? "No todos match your filters"
                : "No todos yet"
            }
          />
          {tasks.length > 0 &&
            !searchTerm &&
            statusFilter === "all" &&
            priorityFilter === "all" &&
            taskFilter === "all" &&
            projectFilter === "all" && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowForm(true)}
              >
                Create Your First Todo
              </Button>
            )}
        </div>
      ) : (
        <div className="todos-list">
          {filteredTodos.map((todo) => {
            const taskInfo = getTaskInfo(todo);
            const projectInfo = getProjectInfo(todo);
            const daysLeft = getDaysLeft(todo.dueDate);
            const isOverdue = daysLeft < 0 && !todo.completed;

            return (
              <Card
                key={todo._id}
                className={`todo-detail-card ${
                  todo.completed ? "completed" : ""
                } ${isOverdue ? "overdue" : ""}`}
              >
                <div className="todo-card-content">
                  <div className="todo-checkbox-column">
                    <Checkbox
                      checked={todo.completed}
                      onChange={() => handleToggle(todo)}
                    />
                  </div>

                  <div className="todo-main-content">
                    <div className="todo-card-header">
                      <div className="todo-title-row">
                        <Title
                          level={5}
                          style={{
                            margin: 0,
                            textDecoration: todo.completed
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {todo.title}
                        </Title>
                        <div className="todo-tags">
                          <Tag color={getPriorityColor(todo.priority)}>
                            {todo.priority}
                          </Tag>
                          {todo.completed && (
                            <Tag color="success">Completed</Tag>
                          )}
                        </div>
                      </div>
                      {todo.description && (
                        <Paragraph
                          type="secondary"
                          ellipsis={{ rows: 2 }}
                          style={{
                            margin: "8px 0 0",
                            textDecoration: todo.completed
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {todo.description}
                        </Paragraph>
                      )}
                    </div>

                    <div className="todo-meta-row">
                      <div
                        className="meta-item clickable"
                        onClick={() => navigate(`/projects/${projectInfo.id}`)}
                      >
                        <FolderOutlined />
                        <Text type="secondary">{projectInfo.name}</Text>
                      </div>
                      <div
                        className="meta-item clickable"
                        onClick={() =>
                          navigate(
                            `/projects/${projectInfo.id}/tasks/${taskInfo.id}`
                          )
                        }
                      >
                        <UnorderedListOutlined />
                        <Text type="secondary">{taskInfo.name}</Text>
                      </div>
                      <div className="meta-item">
                        <Tag color="default">{taskInfo.moduleName}</Tag>
                      </div>
                    </div>

                    <div className="todo-footer-row">
                      <div className="meta-item">
                        <CalendarOutlined />
                        <Text type="secondary">
                          Due: {dayjs(todo.dueDate).format("MMM D, YYYY")}
                          {isOverdue && (
                            <span className="overdue-badge"> (Overdue)</span>
                          )}
                          {!isOverdue && daysLeft <= 3 && daysLeft >= 0 && (
                            <span className="warning-text">
                              {" "}
                              ({daysLeft} days left)
                            </span>
                          )}
                        </Text>
                      </div>
                      {todo.estimatedTime > 0 && (
                        <div className="meta-item">
                          <ClockCircleOutlined />
                          <Text type="secondary">
                            {todo.estimatedTime}h estimated
                          </Text>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="todo-card-actions">
                    <Tooltip title="Edit">
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(todo)}
                      />
                    </Tooltip>
                    <Tooltip title="Delete">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(todo)}
                      />
                    </Tooltip>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Todo Form Modal */}
      <Modal
        title={editingTodo ? "Edit Todo" : "Create New Todo"}
        open={showForm}
        onCancel={handleCloseForm}
        footer={null}
        destroyOnClose
        width={500}
      >
        <TodoForm
          initialData={editingTodo || undefined}
          tasks={tasks}
          onSubmit={editingTodo ? handleUpdate : handleCreate}
          onCancel={handleCloseForm}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
}
