import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Typography, Spin, Progress, Empty } from 'antd';
import { 
  ProjectOutlined, 
  UnorderedListOutlined, 
  CheckSquareOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FireOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { statsService, DashboardStats } from '../services/statsService';

const { Title, Text } = Typography;

export function DashboardPage() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['stats'],
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

  const totalItems = stats.projects.total + stats.tasks.total + stats.todos.total;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div className="page-title-section">
          <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
          <Text type="secondary">Welcome back, {user?.name}! Here's your overview.</Text>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <Row gutter={[16, 16]} className="overview-cards">
        <Col xs={24} sm={8}>
          <Card className="stat-card overview-card projects-card">
            <div className="stat-card-content">
              <div className="stat-icon-wrapper projects-icon">
                <ProjectOutlined />
              </div>
              <div className="stat-details">
                <Text type="secondary">Total Projects</Text>
                <Title level={2} style={{ margin: 0 }}>{stats.projects.total}</Title>
                <div className="stat-sub">
                  <span className="stat-badge active">{stats.projects.active} Active</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card overview-card tasks-card">
            <div className="stat-card-content">
              <div className="stat-icon-wrapper tasks-icon">
                <UnorderedListOutlined />
              </div>
              <div className="stat-details">
                <Text type="secondary">Total Tasks</Text>
                <Title level={2} style={{ margin: 0 }}>{stats.tasks.total}</Title>
                <div className="stat-sub">
                  <span className="stat-badge success">{stats.tasks.completed} Done</span>
                  <span className="stat-badge warning">{stats.tasks.pending} Pending</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card overview-card todos-card">
            <div className="stat-card-content">
              <div className="stat-icon-wrapper todos-icon">
                <CheckSquareOutlined />
              </div>
              <div className="stat-details">
                <Text type="secondary">Total Todos</Text>
                <Title level={2} style={{ margin: 0 }}>{stats.todos.total}</Title>
                <div className="stat-sub">
                  <span className="stat-badge success">{stats.todos.completed} Done</span>
                  <span className="stat-badge warning">{stats.todos.pending} Pending</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Completion Rates */}
      <Row gutter={[16, 16]} className="completion-section">
        <Col xs={24} lg={12}>
          <Card className="chart-card" title={<><RiseOutlined /> Completion Rates</>}>
            <div className="completion-rates">
              <div className="completion-item">
                <div className="completion-header">
                  <Text>Tasks Completion</Text>
                  <Text strong>{stats.completionRate.tasks}%</Text>
                </div>
                <Progress 
                  percent={stats.completionRate.tasks} 
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  trailColor="var(--border-color)"
                  showInfo={false}
                />
              </div>
              <div className="completion-item">
                <div className="completion-header">
                  <Text>Todos Completion</Text>
                  <Text strong>{stats.completionRate.todos}%</Text>
                </div>
                <Progress 
                  percent={stats.completionRate.todos} 
                  strokeColor={{
                    '0%': '#722ed1',
                    '100%': '#eb2f96',
                  }}
                  trailColor="var(--border-color)"
                  showInfo={false}
                />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="chart-card" title={<><ClockCircleOutlined /> Recent Activity (Last 7 Days)</>}>
            <div className="recent-activity">
              <div className="activity-item">
                <div className="activity-icon projects-icon">
                  <ProjectOutlined />
                </div>
                <div className="activity-info">
                  <Text type="secondary">New Projects</Text>
                  <Title level={4} style={{ margin: 0 }}>{stats.recentActivity.projects}</Title>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon tasks-icon">
                  <UnorderedListOutlined />
                </div>
                <div className="activity-info">
                  <Text type="secondary">New Tasks</Text>
                  <Title level={4} style={{ margin: 0 }}>{stats.recentActivity.tasks}</Title>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon todos-icon">
                  <CheckSquareOutlined />
                </div>
                <div className="activity-info">
                  <Text type="secondary">New Todos</Text>
                  <Title level={4} style={{ margin: 0 }}>{stats.recentActivity.todos}</Title>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Priority Distribution and Status */}
      <Row gutter={[16, 16]} className="distribution-section">
        <Col xs={24} md={12} lg={8}>
          <Card className="chart-card" title={<><FireOutlined /> Task Priority</>}>
            <div className="priority-chart">
              <div className="priority-bar-container">
                <div 
                  className="priority-bar high" 
                  style={{ width: `${stats.tasks.total > 0 ? (stats.tasks.priorityDistribution.high / stats.tasks.total) * 100 : 0}%` }}
                />
                <div 
                  className="priority-bar medium" 
                  style={{ width: `${stats.tasks.total > 0 ? (stats.tasks.priorityDistribution.medium / stats.tasks.total) * 100 : 0}%` }}
                />
                <div 
                  className="priority-bar low" 
                  style={{ width: `${stats.tasks.total > 0 ? (stats.tasks.priorityDistribution.low / stats.tasks.total) * 100 : 0}%` }}
                />
              </div>
              <div className="priority-legend">
                <div className="legend-item">
                  <span className="legend-dot high"></span>
                  <Text>High ({stats.tasks.priorityDistribution.high})</Text>
                </div>
                <div className="legend-item">
                  <span className="legend-dot medium"></span>
                  <Text>Medium ({stats.tasks.priorityDistribution.medium})</Text>
                </div>
                <div className="legend-item">
                  <span className="legend-dot low"></span>
                  <Text>Low ({stats.tasks.priorityDistribution.low})</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card className="chart-card" title={<><CheckCircleOutlined /> Project Status</>}>
            <div className="status-chart">
              <div className="status-items">
                <div className="status-item">
                  <div className="status-circle active-circle">
                    <span>{stats.projects.statusDistribution.active}</span>
                  </div>
                  <Text type="secondary">Active</Text>
                </div>
                <div className="status-item">
                  <div className="status-circle completed-circle">
                    <span>{stats.projects.statusDistribution.completed}</span>
                  </div>
                  <Text type="secondary">Completed</Text>
                </div>
                <div className="status-item">
                  <div className="status-circle onhold-circle">
                    <span>{stats.projects.statusDistribution.onHold}</span>
                  </div>
                  <Text type="secondary">On Hold</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={24} lg={8}>
          <Card className="chart-card" title={<><ExclamationCircleOutlined /> Overdue Items</>}>
            <div className="overdue-section">
              <div className="overdue-item">
                <div className="overdue-icon tasks">
                  <UnorderedListOutlined />
                </div>
                <div className="overdue-info">
                  <Title level={3} style={{ margin: 0, color: stats.tasks.overdue > 0 ? '#ff4d4f' : 'inherit' }}>
                    {stats.tasks.overdue}
                  </Title>
                  <Text type="secondary">Overdue Tasks</Text>
                </div>
              </div>
              <div className="overdue-item">
                <div className="overdue-icon todos">
                  <CheckSquareOutlined />
                </div>
                <div className="overdue-info">
                  <Title level={3} style={{ margin: 0, color: stats.todos.overdue > 0 ? '#ff4d4f' : 'inherit' }}>
                    {stats.todos.overdue}
                  </Title>
                  <Text type="secondary">Overdue Todos</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Work Distribution Chart */}
      <Row gutter={[16, 16]} className="work-distribution-section">
        <Col xs={24}>
          <Card className="chart-card" title="Work Distribution">
            <div className="work-distribution">
              {totalItems > 0 ? (
                <>
                  <div className="distribution-visual">
                    <div 
                      className="distribution-segment projects"
                      style={{ width: `${(stats.projects.total / totalItems) * 100}%` }}
                    >
                      <span className="segment-value">{stats.projects.total}</span>
                    </div>
                    <div 
                      className="distribution-segment tasks"
                      style={{ width: `${(stats.tasks.total / totalItems) * 100}%` }}
                    >
                      <span className="segment-value">{stats.tasks.total}</span>
                    </div>
                    <div 
                      className="distribution-segment todos"
                      style={{ width: `${(stats.todos.total / totalItems) * 100}%` }}
                    >
                      <span className="segment-value">{stats.todos.total}</span>
                    </div>
                  </div>
                  <div className="distribution-legend">
                    <div className="legend-item">
                      <span className="legend-dot projects"></span>
                      <Text>Projects ({Math.round((stats.projects.total / totalItems) * 100)}%)</Text>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot tasks"></span>
                      <Text>Tasks ({Math.round((stats.tasks.total / totalItems) * 100)}%)</Text>
                    </div>
                    <div className="legend-item">
                      <span className="legend-dot todos"></span>
                      <Text>Todos ({Math.round((stats.todos.total / totalItems) * 100)}%)</Text>
                    </div>
                  </div>
                </>
              ) : (
                <Empty description="No items to display" />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
