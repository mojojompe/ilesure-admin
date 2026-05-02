import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Switch,
  Popconfirm,
  message,
  Tag,
  Card,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PoweroffOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/admin/v1';

interface Tier {
  _id: string;
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  billingCycle: string;
  features: {
    maxListings: number;
    analytics: string;
    support: string;
    visibility?: string;
  };
  popular: boolean;
  active: boolean;
}

const Tiers: React.FC = () => {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [form] = Form.useForm();

  // Fetch tiers
  const fetchTiers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ilesure_admin_token');
      const response = await axios.get(`${API_URL}/tiers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTiers(response.data.data.tiers || []);
    } catch (error) {
      message.error('Failed to fetch tiers');
      console.error('Fetch tiers error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  // Create or Update tier
  const handleSave = async (values: any) => {
    try {
      const token = localStorage.getItem('ilesure_admin_token');
      const tierData = {
        id: values.id,
        name: values.name,
        price: parseFloat(values.price),
        priceDisplay: `₦${values.price}`,
        billingCycle: values.billingCycle || 'yearly',
        features: {
          maxListings: values.maxListings,
          analytics: values.analytics,
          support: values.support,
          visibility: values.visibility,
        },
        popular: values.popular || false,
      };

      if (editingTier) {
        await axios.put(`${API_URL}/tiers/${editingTier.id}`, tierData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success('Tier updated successfully');
      } else {
        await axios.post(`${API_URL}/tiers`, tierData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success('Tier created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchTiers();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Failed to save tier');
    }
  };

  // Delete tier
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('ilesure_admin_token');
      await axios.delete(`${API_URL}/tiers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Tier deleted successfully');
      fetchTiers();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Failed to delete tier');
    }
  };

  // Toggle active status
  const handleToggleStatus = async (id: string) => {
    try {
      const token = localStorage.getItem('ilesure_admin_token');
      await axios.patch(`${API_URL}/tiers/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Tier status updated');
      fetchTiers();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Failed to update status');
    }
  };

  // Open modal for create/edit
  const openModal = (tier?: Tier) => {
    if (tier) {
      setEditingTier(tier);
      form.setFieldsValue({
        id: tier.id,
        name: tier.name,
        price: tier.price,
        billingCycle: tier.billingCycle,
        maxListings: tier.features.maxListings,
        analytics: tier.features.analytics,
        support: tier.features.support,
        visibility: tier.features.visibility,
        popular: tier.popular,
      });
    } else {
      setEditingTier(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Tier) => (
        <span>
          {text}
          {record.popular && <Tag color="blue" style={{ marginLeft: 8 }}>POPULAR</Tag>}
        </span>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'priceDisplay',
      key: 'price',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Billing',
      dataIndex: 'billingCycle',
      key: 'billing',
    },
    {
      title: 'Max Listings',
      key: 'maxListings',
      render: (_: any, record: Tier) => record.features.maxListings,
    },
    {
      title: 'Status',
      key: 'active',
      render: (_: any, record: Tier) => (
        <Switch
          checked={record.active}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          onChange={() => handleToggleStatus(record.id)}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Tier) => (
        <span>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this tier?"
            description="This action cannot be undone. Make sure no companies are using this tier."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={<Typography.Title level={3} style={{ margin: 0 }}>Tier Management</Typography.Title>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            Add New Tier
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tiers}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingTier ? 'Edit Tier' : 'Create New Tier'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            label="Tier ID"
            name="id"
            rules={[{ required: true, message: 'Please enter tier ID!' }]}
          >
            <Input placeholder="e.g., basic, premium" disabled={!!editingTier} />
          </Form.Item>

          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter tier name!' }]}
          >
            <Input placeholder="e.g., Basic, Premium" />
          </Form.Item>

          <Form.Item
            label="Price (₦)"
            name="price"
            rules={[{ required: true, message: 'Please enter price!' }]}
          >
            <Input type="number" placeholder="e.g., 10000" />
          </Form.Item>

          <Form.Item
            label="Billing Cycle"
            name="billingCycle"
            initialValue="yearly"
          >
            <Input placeholder="e.g., yearly, monthly" />
          </Form.Item>

          <Form.Item
            label="Max Listings"
            name="maxListings"
            rules={[{ required: true, message: 'Please enter max listings!' }]}
          >
            <Input type="number" placeholder="e.g., 15" />
          </Form.Item>

          <Form.Item
            label="Analytics Feature"
            name="analytics"
            rules={[{ required: true, message: 'Please enter analytics description!' }]}
          >
            <Input placeholder="e.g., Basic, Detailed, Advanced" />
          </Form.Item>

          <Form.Item
            label="Support Level"
            name="support"
            rules={[{ required: true, message: 'Please enter support description!' }]}
          >
            <Input placeholder="e.g., email, priority phone + email" />
          </Form.Item>

          <Form.Item
            label="Visibility (optional)"
            name="visibility"
          >
            <Input placeholder="e.g., Student discovery feed, Featured placement" />
          </Form.Item>

          <Form.Item
            name="popular"
            valuePropName="checked"
          >
            <Switch checkedChildren="Popular" unCheckedChildren="Not Popular" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              {editingTier ? 'Update Tier' : 'Create Tier'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tiers;
