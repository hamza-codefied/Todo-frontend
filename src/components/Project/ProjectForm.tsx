import { Form, Input, DatePicker, Select, Button, Space } from 'antd';
import { Project, ProjectFormData } from '../../types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProjectForm({ initialData, onSubmit, onCancel, isLoading }: ProjectFormProps) {
  const [form] = Form.useForm();

  const handleFinish = (values: { name: string; description?: string; eta: dayjs.Dayjs; status?: string }) => {
    onSubmit({
      name: values.name,
      description: values.description,
      eta: values.eta.toISOString(),
      status: values.status as 'active' | 'completed' | 'on-hold' | undefined,
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
              eta: dayjs(initialData.eta),
              status: initialData.status,
            }
          : {
              status: 'active',
              eta: dayjs().add(7, 'day'),
            }
      }
      className="project-form"
    >
      <Form.Item
        name="name"
        label="Project Name"
        rules={[
          { required: true, message: 'Please enter a project name' },
          { max: 100, message: 'Name cannot exceed 100 characters' },
        ]}
      >
        <Input placeholder="Enter project name" size="large" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ max: 500, message: 'Description cannot exceed 500 characters' }]}
      >
        <TextArea
          placeholder="Enter project description (optional)"
          rows={3}
          showCount
          maxLength={500}
        />
      </Form.Item>

      <Form.Item
        name="eta"
        label="Estimated Completion Date"
        rules={[{ required: true, message: 'Please select an ETA' }]}
      >
        <DatePicker
          size="large"
          style={{ width: '100%' }}
          disabledDate={(current) => current && current < dayjs().startOf('day')}
          format="MMMM DD, YYYY"
        />
      </Form.Item>

      {initialData && (
        <Form.Item name="status" label="Status">
          <Select size="large">
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="completed">Completed</Select.Option>
            <Select.Option value="on-hold">On Hold</Select.Option>
          </Select>
        </Form.Item>
      )}

      <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialData ? 'Update Project' : 'Create Project'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
