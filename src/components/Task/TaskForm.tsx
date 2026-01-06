import { Form, Input, DatePicker, Select, Button, Space } from 'antd';
import { Task, TaskFormData, Project } from '../../types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface TaskFormProps {
  projectId?: string;
  projects?: Project[];
  initialData?: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TaskForm({ projectId, projects, initialData, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const [form] = Form.useForm();

  const handleFinish = (values: {
    name: string;
    description?: string;
    moduleName: string;
    dueDate: dayjs.Dayjs;
    priority?: string;
    project?: string;
  }) => {
    // If projectId prop is provided, use it. Otherwise, use the one from the form.
    // We can assert ! here because of form validation rules.
    const selectedProjectId = projectId || values.project!;

    onSubmit({
      name: values.name,
      description: values.description,
      moduleName: values.moduleName,
      dueDate: values.dueDate.toISOString(),
      priority: values.priority as 'low' | 'medium' | 'high' | undefined,
      project: selectedProjectId,
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={
        initialData
          ? {
              name: initialData.name,
              description: initialData.description,
              moduleName: initialData.moduleName,
              dueDate: dayjs(initialData.dueDate),
              priority: initialData.priority,
              project: typeof initialData.project === 'string' 
                ? initialData.project 
                : initialData.project?._id,
            }
          : {
              priority: 'medium',
              dueDate: dayjs().add(3, 'day'),
            }
      }
      className="task-form"
    >
      {!projectId && projects && (
        <Form.Item
          name="project"
          label="Project"
          rules={[{ required: true, message: 'Please select a project' }]}
        >
          <Select
            placeholder="Select a project"
            size="large"
            options={projects.map(p => ({ label: p.name, value: p._id }))}
          />
        </Form.Item>
      )}

      <Form.Item
        name="name"
        label="Task Name"
        rules={[
          { required: true, message: 'Please enter a task name' },
          { max: 100, message: 'Name cannot exceed 100 characters' },
        ]}
      >
        <Input placeholder="Enter task name" size="large" />
      </Form.Item>

      <Form.Item
        name="moduleName"
        label="Module Name"
        rules={[
          { required: true, message: 'Please enter a module name' },
          { max: 50, message: 'Module name cannot exceed 50 characters' },
        ]}
      >
        <Input placeholder="e.g., Frontend, Backend, Database, API" size="large" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ max: 1000, message: 'Description cannot exceed 1000 characters' }]}
      >
        <TextArea
          placeholder="Enter task description (optional)"
          rows={3}
          showCount
          maxLength={1000}
        />
      </Form.Item>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Form.Item
          name="dueDate"
          label="Due Date"
          rules={[{ required: true, message: 'Please select a due date' }]}
        >
          <DatePicker
            size="large"
            style={{ width: '100%' }}
            format="MMMM DD, YYYY"
          />
        </Form.Item>

        <Form.Item name="priority" label="Priority">
          <Select size="large">
            <Select.Option value="low">Low</Select.Option>
            <Select.Option value="medium">Medium</Select.Option>
            <Select.Option value="high">High</Select.Option>
          </Select>
        </Form.Item>
      </div>

      <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialData ? 'Update Task' : 'Create Task'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
