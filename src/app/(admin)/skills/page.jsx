'use client';

import RowActions from '@/components/RowActions';
import CategoriesSkillsService from '@/services/categories-skills.service';
import SkillsService from '@/services/skills.service';
import { formatDate } from '@/utils/format.util';
import {
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProForm,
  ProFormDependency,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, ColorPicker, Col, Flex, Modal, Row, Tag, Typography } from 'antd';
import { Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_COLORS = { background_color: '#009ef7', text_color: '#ffffff' };

const SkillTag = ({ skill, size = 'default' }) => (
  <Tag
    bordered={false}
    style={{
      backgroundColor: skill.background_color || '#1976D2',
      color: skill.text_color || '#FFFFFF',
      fontSize: size === 'large' ? 15 : undefined,
      padding: size === 'large' ? '4px 12px' : undefined,
    }}
  >
    {skill.name || 'Tên kỹ năng'}
  </Tag>
);

const colorItemProps = {
  getValueFromEvent: (color) => color.toHexString(),
};

export default function SkillsPage() {
  const { message } = App.useApp();
  const actionRef = useRef();
  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    CategoriesSkillsService.list()
      .then((data) => setCategories(data || []))
      .catch((error) => console.error('Error fetching categories skills:', error));
  }, []);

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ label: c.label, value: c.id })),
    [categories],
  );

  const getCategoryLabel = (id) => categories.find((c) => c.id === id)?.label ?? '—';

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setFormOpen(true);
  };

  const handleDelete = async (record) => {
    try {
      await SkillsService.delete(record.id);
      message.success('Xóa kỹ năng thành công!');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Error deleting skill:', error);
      message.error('Xóa kỹ năng thất bại!');
    }
  };

  const handleSubmit = async (values) => {
    const payload = {
      name: values.name,
      label: values.label,
      description: values.description ?? '',
      categories_skill_id: values.categories_skill_id,
      background_color: values.background_color,
      text_color: values.text_color,
    };
    try {
      if (editing) {
        await SkillsService.update(editing.id, payload);
        message.success('Cập nhật thành công!');
      } else {
        await SkillsService.create(payload);
        message.success('Tạo kỹ năng thành công!');
      }
      actionRef.current?.reload();
      return true;
    } catch (error) {
      console.error('Error saving skill:', error);
      message.error('Có lỗi xảy ra khi lưu kỹ năng!');
      return false;
    }
  };

  const columns = [
    {
      title: 'Tên kỹ năng',
      dataIndex: 'name',
      search: false,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: (_, record) => <SkillTag skill={record} />,
    },
    {
      title: 'Danh mục',
      dataIndex: 'categories_skill_id',
      valueType: 'select',
      fieldProps: { options: categoryOptions, placeholder: 'Danh mục kỹ năng' },
      sorter: (a, b) => getCategoryLabel(a.categories_skill_id).localeCompare(getCategoryLabel(b.categories_skill_id)),
      render: (_, record) => getCategoryLabel(record.categories_skill_id),
    },
    { title: 'Mô tả', dataIndex: 'description', search: false, ellipsis: true },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <RowActions
          onView={() => setViewing(record)}
          onEdit={() => openEdit(record)}
          onDelete={() => handleDelete(record)}
          deleteTitle={`Bạn có chắc chắn muốn xóa kỹ năng "${record.name}"?`}
        />
      ),
    },
  ];

  return (
    <PageContainer title="Kỹ năng">
      <ProTable
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        search={{ filterType: 'light' }}
        options={{ search: { placeholder: 'Tìm kiếm kỹ năng...' }, density: false, setting: false }}
        pagination={{ defaultPageSize: 10 }}
        locale={{ emptyText: 'Không có kỹ năng nào phù hợp.' }}
        request={async (params) => {
          const data = await SkillsService.list();
          const keyword = (params.keyword || '').trim().toLowerCase();
          const filtered = (data || []).filter((skill) => {
            const matchesSearch =
              !keyword ||
              (skill.name || '').toLowerCase().includes(keyword) ||
              (skill.description || '').toLowerCase().includes(keyword);
            const matchesCategory =
              !params.categories_skill_id || skill.categories_skill_id === params.categories_skill_id;
            return matchesSearch && matchesCategory;
          });
          return { data: filtered, success: true, total: filtered.length };
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<Plus size={16} />} onClick={openCreate}>
            Thêm kỹ năng mới
          </Button>,
        ]}
      />

      <ModalForm
        title={editing ? 'Cập nhật kỹ năng' : 'Thêm kỹ năng mới'}
        width={760}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={editing ? { ...DEFAULT_COLORS, ...editing } : DEFAULT_COLORS}
        modalProps={{ destroyOnHidden: true, maskClosable: false }}
        submitter={{ searchConfig: { submitText: editing ? 'Cập nhật' : 'Lưu', resetText: 'Hủy' } }}
        onFinish={handleSubmit}
      >
        <Row gutter={24}>
          <Col xs={24} md={15}>
            <ProFormText name="name" label="Tên kỹ năng" rules={[{ required: true, message: 'Tên kỹ năng là bắt buộc' }]} />
            <ProFormTextArea name="description" label="Mô tả" fieldProps={{ autoSize: { minRows: 3 } }} />
            <ProFormSelect
              name="categories_skill_id"
              label="Danh mục kỹ năng"
              options={categoryOptions}
              rules={[{ required: true, message: 'Danh mục kỹ năng là bắt buộc' }]}
            />
            <ProFormText name="label" label="Nhãn (Label)" rules={[{ required: true, message: 'Nhãn là bắt buộc' }]} />
            <Flex gap={24}>
              <ProForm.Item name="background_color" label="Màu nền" {...colorItemProps}>
                <ColorPicker showText format="hex" disabledAlpha />
              </ProForm.Item>
              <ProForm.Item name="text_color" label="Màu chữ" {...colorItemProps}>
                <ColorPicker showText format="hex" disabledAlpha />
              </ProForm.Item>
            </Flex>
          </Col>
          <Col xs={24} md={9}>
            <Typography.Text strong>Preview Chip</Typography.Text>
            <ProFormDependency name={['name', 'background_color', 'text_color']}>
              {(skill) =>
                ['#ffffff', '#1e1e2d'].map((bg) => (
                  <div
                    key={bg}
                    style={{
                      marginTop: 12,
                      padding: 16,
                      borderRadius: 8,
                      border: '1px solid #e5e5e5',
                      background: bg,
                    }}
                  >
                    <Typography.Text style={{ display: 'block', marginBottom: 8, fontSize: 12, color: bg === '#ffffff' ? '#666' : '#aaa' }}>
                      {bg === '#ffffff' ? 'Light Mode' : 'Dark Mode'}
                    </Typography.Text>
                    <SkillTag skill={skill} size="large" />
                  </div>
                ))
              }
            </ProFormDependency>
          </Col>
        </Row>
      </ModalForm>

      <Modal open={!!viewing} title={viewing?.name} footer={null} onCancel={() => setViewing(null)}>
        {viewing && (
          <ProDescriptions
            column={1}
            dataSource={viewing}
            columns={[
              { title: 'Hiển thị', dataIndex: 'name', render: () => <SkillTag skill={viewing} /> },
              { title: 'Nhãn', dataIndex: 'label' },
              { title: 'Danh mục', dataIndex: 'categories_skill_id', render: () => getCategoryLabel(viewing.categories_skill_id) },
              { title: 'Mô tả', dataIndex: 'description' },
              { title: 'Ngày tạo', dataIndex: 'created_at', render: () => formatDate(viewing.created_at) },
              { title: 'Ngày cập nhật', dataIndex: 'updated_at', render: () => formatDate(viewing.updated_at) },
            ]}
          />
        )}
      </Modal>
    </PageContainer>
  );
}
