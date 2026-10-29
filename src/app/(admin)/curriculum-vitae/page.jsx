'use client';

import RowActions from '@/components/RowActions';
import CurriculumVitaeService from '@/services/curriculum-vitae.service';
import { formatDate } from '@/utils/format.util';
import { PageContainer, ProDescriptions, ProTable } from '@ant-design/pro-components';
import { App, Avatar, Button, Modal, Space, Typography } from 'antd';
import { Plus, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

export default function CurriculumVitaePage() {
  const { message } = App.useApp();
  const router = useRouter();
  const actionRef = useRef();
  const [viewing, setViewing] = useState(null);

  const handleDelete = async (record) => {
    try {
      await CurriculumVitaeService.delete(record.id, 'images', record.avatar);
      message.success('Thao tác thành công!');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Error deleting curriculumVitaes:', error);
      message.error('Thao tác thất bại!');
    }
  };

  const columns = [
    {
      title: 'Tiêu đề CV',
      dataIndex: 'title',
      render: (_, record) => (
        <Space>
          <Avatar src={record.avatar || undefined} icon={<User size={16} />} />
          <div>
            <Typography.Text strong>{record.title}</Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              /{record.slug}
            </Typography.Text>
          </div>
        </Space>
      ),
    },
    { title: 'Họ và tên', dataIndex: 'full_name', ellipsis: true },
    { title: 'Số điện thoại', dataIndex: 'phone', width: 140 },
    { title: 'Template', dataIndex: 'template', width: 120 },
    { title: 'Ngày tạo', dataIndex: 'created_at', width: 120, render: (_, r) => formatDate(r.created_at) },
    {
      title: 'Thao tác',
      valueType: 'option',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <RowActions
          onView={() => setViewing(record)}
          onEdit={() => router.push(`/curriculum-vitae/${record.id}/edit`)}
          onDelete={() => handleDelete(record)}
          deleteTitle={`Bạn có chắc chắn muốn xóa CV "${record.title}"?`}
        />
      ),
    },
  ];

  return (
    <PageContainer title="CVs">
      <ProTable
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        search={false}
        options={{ search: { placeholder: 'Tìm kiếm theo tiêu đề, số điện thoại' }, density: false, setting: false }}
        pagination={{ defaultPageSize: 10 }}
        request={async (params) => {
          const data = await CurriculumVitaeService.list();
          const keyword = (params.keyword || '').trim().toLowerCase();
          const filtered = (data || []).filter(
            (cv) =>
              !keyword ||
              (cv.title || '').toLowerCase().includes(keyword) ||
              (cv.phone || '').toLowerCase().includes(keyword),
          );
          return { data: filtered, success: true, total: filtered.length };
        }}
        toolBarRender={() => [
          <Link key="add" href="/curriculum-vitae/create">
            <Button type="primary" icon={<Plus size={16} />}>
              Thêm CV mới
            </Button>
          </Link>,
        ]}
      />

      <Modal open={!!viewing} title={viewing?.title} footer={null} width={640} onCancel={() => setViewing(null)}>
        {viewing && (
          <ProDescriptions
            column={1}
            dataSource={viewing}
            columns={[
              { title: 'Slug', dataIndex: 'slug', copyable: true },
              { title: 'Template', dataIndex: 'template' },
              { title: 'Họ và tên', dataIndex: 'full_name' },
              { title: 'Số điện thoại', dataIndex: 'phone' },
              { title: 'Email', dataIndex: 'email' },
              { title: 'Địa chỉ', dataIndex: 'address' },
              { title: 'Giới tính', dataIndex: 'gender' },
              { title: 'Ngày sinh', dataIndex: 'birthday', render: () => formatDate(viewing.birthday) },
              {
                title: 'Số nhóm',
                dataIndex: 'groups_event',
                render: () => (viewing.groups_event || []).length,
              },
              { title: 'Ngày tạo', dataIndex: 'created_at', render: () => formatDate(viewing.created_at) },
              { title: 'Ngày cập nhật', dataIndex: 'updated_at', render: () => formatDate(viewing.updated_at) },
            ]}
          />
        )}
      </Modal>
    </PageContainer>
  );
}
