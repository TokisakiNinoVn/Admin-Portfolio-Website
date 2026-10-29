'use client';

import RowActions from '@/components/RowActions';
import FriendsService from '@/services/friends.service';
import {
  ModalForm,
  PageContainer,
  ProFormText,
  ProFormTextArea,
  ProList,
} from '@ant-design/pro-components';
import { App, Avatar, Button, Typography } from 'antd';
import { Plus, User } from 'lucide-react';
import { useRef, useState } from 'react';

export default function FriendsPage() {
  const { message } = App.useApp();
  const actionRef = useRef();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setFormOpen(true);
  };

  const openWebsite = (record) => {
    if (record.personal_website) window.open(record.personal_website, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async (record) => {
    try {
      await FriendsService.delete(record.id);
      message.success('Thao tác thành công!');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Error deleting friends:', error);
      message.error('Thao tác thất bại!');
    }
  };

  const handleSubmit = async (values) => {
    const payload = {
      name: values.name,
      avatar_link: values.avatar_link,
      personal_website: values.personal_website,
      description: values.description ?? '',
    };
    try {
      if (editing) {
        await FriendsService.update(editing.id, payload);
        message.success('Cập nhật bạn bè thành công!');
      } else {
        await FriendsService.create(payload);
        message.success('Thêm bạn bè thành công!');
      }
      actionRef.current?.reload();
      return true;
    } catch (error) {
      console.error('Error saving friends:', error);
      message.error('Có lỗi xảy ra khi lưu bạn bè!');
      return false;
    }
  };

  return (
    <PageContainer title="Friends">
      <ProList
        rowKey="id"
        actionRef={actionRef}
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        pagination={{ defaultPageSize: 12 }}
        options={{ search: { placeholder: 'Tìm kiếm bạn bè' }, density: false, setting: false, reload: true }}
        request={async (params) => {
          const data = await FriendsService.list();
          const keyword = (params.keyword || '').trim().toLowerCase();
          const filtered = (data || []).filter((f) => !keyword || (f.name || '').toLowerCase().includes(keyword));
          return { data: filtered, success: true, total: filtered.length };
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<Plus size={16} />} onClick={openCreate}>
            Thêm bạn bè
          </Button>,
        ]}
        metas={{
          avatar: {
            render: (_, record) => <Avatar size={56} src={record.avatar_link} icon={<User size={24} />} />,
          },
          title: { dataIndex: 'name' },
          description: {
            render: (_, record) => (
              <>
                <Typography.Link
                  href={record.personal_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  ellipsis
                  style={{ display: 'block', maxWidth: '100%' }}
                >
                  {record.personal_website}
                </Typography.Link>
                {record.description && (
                  <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: '4px 0 0' }}>
                    {record.description}
                  </Typography.Paragraph>
                )}
              </>
            ),
          },
          actions: {
            cardActionProps: 'actions',
            render: (_, record) => [
              <RowActions
                key="actions"
                viewTitle="Xem trang bạn bè"
                onView={() => openWebsite(record)}
                onEdit={() => openEdit(record)}
                onDelete={() => handleDelete(record)}
                deleteTitle={`Bạn có chắc chắn muốn xóa "${record.name}"?`}
              />,
            ],
          },
        }}
      />

      <ModalForm
        title={editing ? 'Cập nhật bạn bè' : 'Thêm mới bạn bè hiển thị'}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={editing ?? {}}
        modalProps={{ destroyOnHidden: true, maskClosable: false }}
        submitter={{ searchConfig: { submitText: editing ? 'Cập nhật' : 'Lưu', resetText: 'Hủy' } }}
        onFinish={handleSubmit}
      >
        <ProFormText name="name" label="Tên bạn bè" rules={[{ required: true, message: 'Tên bạn bè là bắt buộc' }]} />
        <ProFormText
          name="avatar_link"
          label="Ảnh đại diện (URL)"
          rules={[{ required: true, message: 'Ảnh đại diện là bắt buộc' }]}
        />
        <ProFormText
          name="personal_website"
          label="Website cá nhân"
          rules={[{ required: true, message: 'Website cá nhân là bắt buộc' }]}
        />
        <ProFormTextArea name="description" label="Mô tả" fieldProps={{ autoSize: { minRows: 3 } }} />
      </ModalForm>
    </PageContainer>
  );
}
