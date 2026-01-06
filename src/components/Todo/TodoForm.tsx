import { useEffect } from 'react';
import { Todo, TodoFormData } from '../../types';
import { Form, Input, Button, Select, DatePicker, Space, InputNumber } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface TodoFormProps {
  taskId: string;
  initialData?: Todo;
  onSubmit: (data: TodoFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormValues {
  title: string;
  description?: string;
  dueDate: dayjs.Dayjs;
  priority: 'low' | 'medium' | 'high';
  estimatedHours?: number;
  estimatedMinutes?: number;
}

export function TodoForm({ taskId, initialData, onSubmit, onCancel, isLoading }: TodoFormProps) {
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (initialData) {
      const hours = Math.floor(initialData.estimatedTime / 60);
      const minutes = initialData.estimatedTime % 60;
      form.setFieldsValue({
        title: initialData.title,
        description: initialData.description || '',
        dueDate: dayjs(initialData.dueDate),
        priority: initialData.priority,
        estimatedHours: hours || undefined,
        estimatedMinutes: minutes || undefined,
      });
    } else {
      form.setFieldsValue({
        dueDate: dayjs(),
        priority: 'medium',
      });
    }
  }, [initialData, form]);

  const handleFinish = async (values: FormValues) => {
    const estimatedTime = ((values.estimatedHours || 0) * 60) + (values.estimatedMinutes || 0);
    await onSubmit({
      title: values.title,
      description: values.description || undefined,
      dueDate: values.dueDate.format('YYYY-MM-DD'),
      priority: values.priority,
      estimatedTime: estimatedTime > 0 ? estimatedTime : undefined,
      task: taskId,
    });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      className="todo-form"
      requiredMark={false}
    >
      <Form.Item
        name="title"
        label="Title"
        rules={[
          { required: true, message: 'Please enter a title' },
          { max: 100, message: 'Title must be less than 100 characters' }
        ]}
      >
        <Input placeholder="What needs to be done?" maxLength={100} />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[
          { max: 500, message: 'Description must be less than 500 characters' }
        ]}
      >
        <TextArea 
          placeholder="Add some details..." 
          rows={3}
          maxLength={500}
          showCount
        />
      </Form.Item>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Form.Item
          name="dueDate"
          label="Due Date"
          rules={[{ required: true, message: 'Please select a due date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="priority"
          label="Priority"
        >
          <Select
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />
        </Form.Item>
      </div>

      <Form.Item label="Estimated Time" style={{ marginBottom: 0 }}>
        <Space>
          <Form.Item name="estimatedHours" noStyle>
            <InputNumber min={0} max={999} placeholder="0" addonAfter="hours" style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="estimatedMinutes" noStyle>
            <InputNumber min={0} max={59} placeholder="0" addonAfter="min" style={{ width: 110 }} />
          </Form.Item>
        </Space>
      </Form.Item>

      <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialData ? 'Update Todo' : 'Create Todo'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

