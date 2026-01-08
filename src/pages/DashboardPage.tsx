import { useQuery } from "@tanstack/react-query";
import { Card, Row, Col, Typography, Spin, Empty, Statistic } from "antd";
import { Pie, Column, Liquid } from "@ant-design/charts";
import {
  ProjectOutlined,
  UnorderedListOutlined,
  CheckSquareOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FireOutlined,
  TrophyOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { statsService, DashboardStats } from "../services/statsService";

const { Title, Text } = Typography;

export function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["stats"],
    queryFn: statsService.getStats,
  });

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-empty">
        <Empty description="No data available" />
      </div>
    );
  }

  // Calculate totals
  const totalItems =
    stats.projects.total + stats.tasks.total + stats.todos.total;
  const totalCompleted =
    stats.tasks.completed + stats.todos.completed + stats.projects.completed;
  const overallCompletionRate =
    totalItems > 0
      ? Math.round(
          (totalCompleted /
            (stats.tasks.total + stats.todos.total + stats.projects.total)) *
            100
        )
      : 0;

  // Pie chart data for work distribution
  const workDistributionData = [
    { type: "Projects", value: stats.projects.total, color: "#1890ff" },
    { type: "Tasks", value: stats.tasks.total, color: "#52c41a" },
    { type: "Todos", value: stats.todos.total, color: "#722ed1" },
  ];

  // Pie chart for task priority distribution
  const taskPriorityData = [
    {
      type: "High",
      value: stats.tasks.priorityDistribution.high,
      color: "#ff4d4f",
    },
    {
      type: "Medium",
      value: stats.tasks.priorityDistribution.medium,
      color: "#faad14",
    },
    {
      type: "Low",
      value: stats.tasks.priorityDistribution.low,
      color: "#52c41a",
    },
  ];

  // Column chart for project status
  const projectStatusData = [
    {
      status: "Active",
      count: stats.projects.statusDistribution.active,
      color: "#1890ff",
    },
    {
      status: "Completed",
      count: stats.projects.statusDistribution.completed,
      color: "#52c41a",
    },
    {
      status: "On Hold",
      count: stats.projects.statusDistribution.onHold,
      color: "#faad14",
    },
  ];

  // Recent activity data for column chart
  const recentActivityData = [
    {
      type: "Projects",
      count: stats.recentActivity.projects,
      category: "Last 7 Days",
    },
    {
      type: "Tasks",
      count: stats.recentActivity.tasks,
      category: "Last 7 Days",
    },
    {
      type: "Todos",
      count: stats.recentActivity.todos,
      category: "Last 7 Days",
    },
  ];

  // Pie chart config for work distribution
  const workDistributionConfig = {
    data: workDistributionData,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    innerRadius: 0.6,
    legend: {
      position: "bottom" as const,
    },
    label: {
      type: "inner" as const,
      content: "{percentage}",
      style: { fontSize: 12, fill: "#fff" },
    },
    color: ["#1890ff", "#52c41a", "#722ed1"],
    statistic: {
      title: {
        content: "Total",
        style: { fontSize: "14px", color: "var(--text-secondary)" },
      },
      content: {
        content: totalItems.toString(),
        style: {
          fontSize: "24px",
          fontWeight: "bold",
          color: "var(--text-color)",
        },
      },
    },
  };

  // Pie chart config for task priority
  const taskPriorityConfig = {
    data: taskPriorityData,
    angleField: "value",
    colorField: "type",
    radius: 0.9,
    legend: {
      position: "bottom" as const,
    },
    label: {
      type: "spider" as const,
      content: "{name}: {value}",
    },
    color: ["#ff4d4f", "#faad14", "#52c41a"],
  };

  // Column chart config for project status
  const projectStatusConfig = {
    data: projectStatusData,
    xField: "status",
    yField: "count",
    colorField: "status",
    color: ["#1890ff", "#52c41a", "#faad14"],
    legend: false as const,
    label: {
      position: "top" as const,
      style: { fill: "var(--text-color)" },
    },
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
  };

  // Recent activity column chart config
  const recentActivityConfig = {
    data: recentActivityData,
    xField: "type",
    yField: "count",
    colorField: "type",
    color: ["#1890ff", "#52c41a", "#722ed1"],
    legend: false as const,
    label: {
      position: "top" as const,
      style: { fill: "var(--text-color)" },
    },
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
  };

  // Liquid chart config for overall completion
  const liquidConfig = {
    percent: overallCompletionRate / 100,
    outline: {
      border: 3,
      distance: 4,
    },
    wave: {
      length: 128,
    },
    color:
      overallCompletionRate >= 75
        ? "#52c41a"
        : overallCompletionRate >= 50
        ? "#1890ff"
        : overallCompletionRate >= 25
        ? "#faad14"
        : "#ff4d4f",
  };

  return (
    <div className="dashboard-page">
      {/* Welcome Header */}
      <div className="dashboard-welcome-header">
        <div className="welcome-content">
          <Title level={2} style={{ margin: 0 }}>
            Welcome back, {user?.name}! 👋
          </Title>
          <Text type="secondary" className="welcome-subtitle">
            Here's an overview of your productivity stats
          </Text>
        </div>
        <div className="welcome-date">
          <Text type="secondary">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <Row gutter={[24, 24]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="quick-stat-card projects-gradient" bordered={false}>
            <div className="quick-stat-content">
              <div className="quick-stat-icon">
                <ProjectOutlined />
              </div>
              <div className="quick-stat-info">
                <Statistic
                  title={
                    <span className="stat-title-white">Total Projects</span>
                  }
                  value={stats.projects.total}
                  valueStyle={{
                    color: "#fff",
                    fontSize: "32px",
                    fontWeight: 700,
                  }}
                />
                <div className="quick-stat-sub">
                  <span className="stat-mini-badge">
                    {stats.projects.active} Active
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="quick-stat-card tasks-gradient" bordered={false}>
            <div className="quick-stat-content">
              <div className="quick-stat-icon">
                <UnorderedListOutlined />
              </div>
              <div className="quick-stat-info">
                <Statistic
                  title={<span className="stat-title-white">Total Tasks</span>}
                  value={stats.tasks.total}
                  valueStyle={{
                    color: "#fff",
                    fontSize: "32px",
                    fontWeight: 700,
                  }}
                />
                <div className="quick-stat-sub">
                  <span className="stat-mini-badge">
                    {stats.tasks.completed} Completed
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="quick-stat-card todos-gradient" bordered={false}>
            <div className="quick-stat-content">
              <div className="quick-stat-icon">
                <CheckSquareOutlined />
              </div>
              <div className="quick-stat-info">
                <Statistic
                  title={<span className="stat-title-white">Total Todos</span>}
                  value={stats.todos.total}
                  valueStyle={{
                    color: "#fff",
                    fontSize: "32px",
                    fontWeight: 700,
                  }}
                />
                <div className="quick-stat-sub">
                  <span className="stat-mini-badge">
                    {stats.todos.completed} Completed
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="quick-stat-card danger-gradient" bordered={false}>
            <div className="quick-stat-content">
              <div className="quick-stat-icon">
                <ExclamationCircleOutlined />
              </div>
              <div className="quick-stat-info">
                <Statistic
                  title={
                    <span className="stat-title-white">Overdue Items</span>
                  }
                  value={stats.tasks.overdue + stats.todos.overdue}
                  valueStyle={{
                    color: "#fff",
                    fontSize: "32px",
                    fontWeight: 700,
                  }}
                />
                <div className="quick-stat-sub">
                  <span className="stat-mini-badge">
                    {stats.tasks.overdue} Tasks • {stats.todos.overdue} Todos
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Section - Row 1 */}
      <Row gutter={[24, 24]} className="charts-row">
        {/* Overall Completion Gauge */}
        <Col xs={24} md={8}>
          <Card
            className="chart-card glass-card"
            title={
              <div className="chart-title">
                <TrophyOutlined className="chart-title-icon trophy" />
                <span>Overall Completion</span>
              </div>
            }
          >
            <div className="liquid-chart-container">
              <Liquid {...liquidConfig} height={200} />
              <div className="completion-label">
                <Text type="secondary">Keep going! You're doing great.</Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Work Distribution Donut Chart */}
        <Col xs={24} md={8}>
          <Card
            className="chart-card glass-card"
            title={
              <div className="chart-title">
                <RiseOutlined className="chart-title-icon rise" />
                <span>Work Distribution</span>
              </div>
            }
          >
            {totalItems > 0 ? (
              <Pie {...workDistributionConfig} height={250} />
            ) : (
              <Empty description="No items yet" className="chart-empty" />
            )}
          </Card>
        </Col>

        {/* Task Priority Distribution */}
        <Col xs={24} md={8}>
          <Card
            className="chart-card glass-card"
            title={
              <div className="chart-title">
                <FireOutlined className="chart-title-icon fire" />
                <span>Task Priority</span>
              </div>
            }
          >
            {stats.tasks.total > 0 ? (
              <Pie {...taskPriorityConfig} height={250} />
            ) : (
              <Empty description="No tasks yet" className="chart-empty" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Charts Section - Row 2 */}
      <Row gutter={[24, 24]} className="charts-row">
        {/* Project Status Bar Chart */}
        <Col xs={24} md={12}>
          <Card
            className="chart-card glass-card"
            title={
              <div className="chart-title">
                <CheckCircleOutlined className="chart-title-icon check" />
                <span>Project Status</span>
              </div>
            }
          >
            {stats.projects.total > 0 ? (
              <Column {...projectStatusConfig} height={250} />
            ) : (
              <Empty description="No projects yet" className="chart-empty" />
            )}
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} md={12}>
          <Card
            className="chart-card glass-card"
            title={
              <div className="chart-title">
                <ClockCircleOutlined className="chart-title-icon clock" />
                <span>Recent Activity (Last 7 Days)</span>
              </div>
            }
          >
            <Column {...recentActivityConfig} height={250} />
          </Card>
        </Col>
      </Row>

      {/* Completion Rates Section */}
      <Row gutter={[24, 24]} className="charts-row">
        <Col xs={24} md={12}>
          <Card
            className="chart-card glass-card completion-card"
            title={
              <div className="chart-title">
                <ThunderboltOutlined className="chart-title-icon thunder" />
                <span>Completion Rates</span>
              </div>
            }
          >
            <div className="completion-rates-modern">
              <div className="completion-rate-item">
                <div className="rate-info">
                  <div className="rate-label">
                    <UnorderedListOutlined className="rate-icon tasks" />
                    <Text>Tasks Completion</Text>
                  </div>
                  <Text strong className="rate-value">
                    {stats.completionRate.tasks}%
                  </Text>
                </div>
                <div className="rate-bar-container">
                  <div
                    className="rate-bar tasks-bar"
                    style={{ width: `${stats.completionRate.tasks}%` }}
                  />
                </div>
                <div className="rate-details">
                  <Text type="secondary">
                    {stats.tasks.completed} of {stats.tasks.total} completed
                  </Text>
                </div>
              </div>

              <div className="completion-rate-item">
                <div className="rate-info">
                  <div className="rate-label">
                    <CheckSquareOutlined className="rate-icon todos" />
                    <Text>Todos Completion</Text>
                  </div>
                  <Text strong className="rate-value">
                    {stats.completionRate.todos}%
                  </Text>
                </div>
                <div className="rate-bar-container">
                  <div
                    className="rate-bar todos-bar"
                    style={{ width: `${stats.completionRate.todos}%` }}
                  />
                </div>
                <div className="rate-details">
                  <Text type="secondary">
                    {stats.todos.completed} of {stats.todos.total} completed
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* Productivity Summary */}
        <Col xs={24} md={12}>
          <Card
            className="chart-card glass-card summary-card"
            title={
              <div className="chart-title">
                <ProjectOutlined className="chart-title-icon project" />
                <span>Productivity Summary</span>
              </div>
            }
          >
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-icon pending">
                  <ClockCircleOutlined />
                </div>
                <div className="summary-info">
                  <Text className="summary-value">{stats.tasks.pending}</Text>
                  <Text type="secondary" className="summary-label">
                    Pending Tasks
                  </Text>
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-icon pending">
                  <ClockCircleOutlined />
                </div>
                <div className="summary-info">
                  <Text className="summary-value">{stats.todos.pending}</Text>
                  <Text type="secondary" className="summary-label">
                    Pending Todos
                  </Text>
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-icon high">
                  <FireOutlined />
                </div>
                <div className="summary-info">
                  <Text className="summary-value">
                    {stats.tasks.priorityDistribution.high}
                  </Text>
                  <Text type="secondary" className="summary-label">
                    High Priority
                  </Text>
                </div>
              </div>
              <div className="summary-item">
                <div className="summary-icon completed">
                  <CheckCircleOutlined />
                </div>
                <div className="summary-info">
                  <Text className="summary-value">
                    {stats.projects.completed}
                  </Text>
                  <Text type="secondary" className="summary-label">
                    Projects Done
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
