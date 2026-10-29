'use client';

import RowActions from '@/components/RowActions';
import SkillCategoriesService from '@/services/categories-skills.service';
import { formatDate } from '@/utils/format.util';
import {
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { App, Button, Modal } from 'antd';
import { Plus } from 'lucide-react';
import { useRef, useState } from 'react';

const matches = (text, keyword) => (text || '').toLowerCase().includes(keyword);

export default function CategoriesSkillPage() {
  const { message } = App.useApp();
  const actionRef = useRef();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

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
      await SkillCategoriesService.delete(record.id);
      message.success('Thao tác thành công!');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Error deleting skillCategories:', error);
      message.error('Thao tác thất bại!');
    }
  };

  const handleSubmit = async (values) => {
    const payload = { label: values.label, description: values.description };
    try {
      if (editing) {
        await SkillCategoriesService.update(editing.id, payload);
        message.success('Cập nhật danh mục kỹ năng thành công!');
      } else {
        await SkillCategoriesService.create(payload);
        message.success('Tạo danh mục kỹ năng thành công!');
      }
      actionRef.current?.reload();
      return true;
    } catch (error) {
      console.error('Error saving skillCategories:', error);
      message.error('Có lỗi xảy ra khi lưu danh mục kỹ năng!');
      return false;
    }
  };

  const columns = [
    { title: 'Tiêu đề', dataIndex: 'label', ellipsis: true },
    { title: 'Mô tả', dataIndex: 'description', ellipsis: true },
    { title: 'Ngày tạo', dataIndex: 'created_at', width: 140, render: (_, r) => formatDate(r.created_at) },
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
          deleteTitle={`Bạn có chắc chắn muốn xóa danh mục "${record.label}"?`}
        />
      ),
    },
  ];

  return (
    <PageContainer title="Danh mục kỹ năng">
      <ProTable
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        search={false}
        options={{ search: { placeholder: 'Tìm kiếm danh mục kỹ năng' }, density: false, setting: false }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const data = await SkillCategoriesService.list();
          const keyword = (params.keyword || '').trim().toLowerCase();
          const filtered = (data || []).filter(
            (item) => !keyword || matches(item.label, keyword) || matches(item.description, keyword),
          );
          return { data: filtered, success: true, total: filtered.length };
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<Plus size={16} />} onClick={openCreate}>
            Thêm danh mục kỹ năng
          </Button>,
        ]}
      />

      <ModalForm
        title={editing ? 'Cập nhật danh mục kỹ năng' : 'Thêm danh mục kỹ năng mới'}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={editing ?? {}}
        modalProps={{ destroyOnHidden: true, maskClosable: false }}
        submitter={{ searchConfig: { submitText: editing ? 'Cập nhật' : 'Lưu', resetText: 'Hủy' } }}
        onFinish={handleSubmit}
      >
        <ProFormText name="label" label="Tiêu đề" rules={[{ required: true, message: 'Tiêu đề là bắt buộc' }]} />
        <ProFormTextArea name="description" label="Mô tả" fieldProps={{ autoSize: { minRows: 3 } }} />
      </ModalForm>

      <Modal open={!!viewing} title={viewing?.label} footer={null} onCancel={() => setViewing(null)}>
        <ProDescriptions
          column={1}
          dataSource={viewing ?? {}}
          columns={[
            { title: 'Mô tả', dataIndex: 'description' },
            { title: 'Ngày tạo', dataIndex: 'created_at', render: (_, r) => formatDate(r.created_at) },
            { title: 'Ngày cập nhật', dataIndex: 'updated_at', render: (_, r) => formatDate(r.updated_at) },
          ]}
        />
      </Modal>
    </PageContainer>
  );
}
