'use client';

import RowActions from '@/components/RowActions';
import AppSettingService from '@/services/app-settings.service';
import { formatDate, formatDateTime } from '@/utils/format.util';
import {
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormSwitch,
  ProFormText,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import { App, Badge, Button, Modal, Space, Switch, Tooltip, Typography } from 'antd';
import { Copy, ExternalLink, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const STATUS_ENUM = {
  active: { text: 'Đang bật', status: 'Success' },
  inactive: { text: 'Đang tắt', status: 'Default' },
};

export default function AppSettingsPage() {
  const { message } = App.useApp();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState();
  const [togglingIds, setTogglingIds] = useState(() => new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const loadApps = useCallback(
    () =>
      AppSettingService.list()
        .then((data) => setApps(data || []))
        .catch((error) => {
          console.error('Error fetching app settings:', error);
          message.error('Không thể tải danh sách ứng dụng!');
        })
        .finally(() => setLoading(false)),
    [message],
  );

  const fetchApps = () => {
    setLoading(true);
    return loadApps();
  };

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  const activeCount = apps.filter((a) => a.is_active).length;

  const filteredApps = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return apps.filter((item) => {
      const matchesSearch =
        !query ||
        (item.name_app || '').toLowerCase().includes(query) ||
        (item.link_app || '').toLowerCase().includes(query);
      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'active' && Boolean(item.is_active)) ||
        (statusFilter === 'inactive' && !item.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [apps, keyword, statusFilter]);

  const replaceApp = (updated) => setApps((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    setFormOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        const updated = await AppSettingService.update(editing.id, {
          name_app: values.name_app.trim(),
          link_app: values.link_app ? values.link_app.trim() : '',
          is_active: Boolean(values.is_active),
        });
        if (updated) replaceApp(updated);
        else fetchApps();
        message.success('Cập nhật ứng dụng thành công!');
      } else {
        const created = await AppSettingService.create(values);
        if (created) setApps((prev) => [created, ...prev]);
        else fetchApps();
        message.success('Thêm ứng dụng thành công!');
      }
      return true;
    } catch (error) {
      console.error('Error saving app setting:', error);
      message.error('Có lỗi xảy ra khi lưu ứng dụng!');
      return false;
    }
  };

  const handleDelete = async (record) => {
    try {
      await AppSettingService.delete(record.id);
      setApps((prev) => prev.filter((a) => a.id !== record.id));
      message.success('Xóa ứng dụng thành công!');
    } catch (error) {
      console.error('Error deleting app setting:', error);
      message.error('Xóa ứng dụng thất bại!');
    }
  };

  const toggleActive = async (record) => {
    if (togglingIds.has(record.id)) return;
    const nextStatus = !record.is_active;

    setTogglingIds((prev) => new Set(prev).add(record.id));
    replaceApp({ ...record, is_active: nextStatus });

    try {
      const updated = await AppSettingService.toggleActive(record.id, nextStatus);
      if (updated) replaceApp(updated);
      message[nextStatus ? 'success' : 'info'](
        `Đã ${nextStatus ? 'bật' : 'tắt'} ứng dụng "${record.name_app || ''}"!`,
      );
    } catch (error) {
      console.error('Error toggling app status:', error);
      replaceApp(record);
      message.error('Không thể thay đổi trạng thái ứng dụng!');
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(record.id);
        return next;
      });
    }
  };

  const copyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link);
      message.success('Đã sao chép liên kết!');
    } catch (error) {
      console.error('Clipboard error:', error);
    }
  };

  const columns = [
    { title: 'STT', dataIndex: 'index', valueType: 'indexBorder', width: 60, align: 'center' },
    {
      title: 'Tên ứng dụng',
      dataIndex: 'name_app',
      render: (_, record) => (
        <div>
          <Typography.Text strong>{record.name_app || '—'}</Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            ID: #{record.id}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: 'Đường dẫn (URL)',
      dataIndex: 'link_app',
      render: (_, record) =>
        record.link_app ? (
          <Space size={4}>
            <Typography.Link
              href={record.link_app}
              target="_blank"
              rel="noopener noreferrer"
              ellipsis
              style={{ maxWidth: 260 }}
            >
              {record.link_app}
            </Typography.Link>
            <Tooltip title="Sao chép liên kết">
              <Button type="text" size="small" icon={<Copy size={14} />} onClick={() => copyLink(record.link_app)} />
            </Tooltip>
            <Tooltip title="Mở tab mới">
              <Button
                type="text"
                size="small"
                icon={<ExternalLink size={14} />}
                href={record.link_app}
                target="_blank"
                rel="noopener noreferrer"
              />
            </Tooltip>
          </Space>
        ) : (
          <Typography.Text type="secondary" italic>
            Chưa cấu hình
          </Typography.Text>
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Badge status={record.is_active ? 'success' : 'default'} text={record.is_active ? 'Đang bật' : 'Đang tắt'} />
      ),
    },
    {
      title: 'Bật / Tắt',
      dataIndex: 'toggle',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={Boolean(record.is_active)}
          loading={togglingIds.has(record.id)}
          onChange={() => toggleActive(record)}
        />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      width: 120,
      align: 'center',
      render: (_, record) => formatDate(record.created_at),
    },
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
          deleteTitle={`Bạn có chắc chắn muốn xóa ứng dụng "${record.name_app || 'này'}"? Hành động này không thể hoàn tác.`}
        />
      ),
    },
  ];

  return (
    <PageContainer
      title="Cấu hình Ứng dụng"
      subTitle="Quản lý danh sách các ứng dụng, chuyển đổi trạng thái bật/tắt và liên kết hệ thống"
    >
      <StatisticCard.Group direction="row" style={{ marginBottom: 16 }}>
        <StatisticCard statistic={{ title: 'Tổng ứng dụng', value: apps.length }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: 'Đang bật', value: activeCount, status: 'success' }} />
        <StatisticCard.Divider />
        <StatisticCard statistic={{ title: 'Đang tắt', value: apps.length - activeCount, status: 'default' }} />
      </StatisticCard.Group>

      <ProTable
        rowKey="id"
        columns={columns}
        dataSource={filteredApps}
        loading={loading}
        search={false}
        pagination={{ defaultPageSize: 10 }}
        rowClassName={(record) => (record.is_active ? '' : 'row-inactive')}
        options={{
          search: {
            placeholder: 'Tìm kiếm theo tên app, liên kết...',
            allowClear: true,
            onSearch: (value) => setKeyword(value || ''),
          },
          reload: fetchApps,
          density: false,
          setting: false,
        }}
        toolbar={{
          filter: (
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          ),
        }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<Plus size={16} />} onClick={openCreate}>
            Thêm ứng dụng
          </Button>,
        ]}
        locale={{
          emptyText:
            keyword || statusFilter ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có ứng dụng nào',
        }}
      />

      <ModalForm
        title={editing ? 'Chỉnh sửa ứng dụng' : 'Thêm ứng dụng mới'}
        width={560}
        open={formOpen}
        onOpenChange={setFormOpen}
        initialValues={editing ? { ...editing, is_active: Boolean(editing.is_active) } : { is_active: true }}
        modalProps={{ destroyOnHidden: true, maskClosable: false }}
        submitter={{ searchConfig: { submitText: 'Lưu ứng dụng', resetText: 'Hủy' } }}
        onFinish={handleSubmit}
      >
        <ProFormText
          name="name_app"
          label="Tên ứng dụng"
          placeholder="Ví dụ: Portfolio Website, Chat App, LMS..."
          fieldProps={{ autoFocus: true }}
          rules={[
            { required: true, whitespace: true, message: 'Tên ứng dụng là bắt buộc' },
          ]}
        />
        <ProFormText name="link_app" label="Đường dẫn ứng dụng (URL)" placeholder="Ví dụ: https://my-app.example.com" />
        <ProFormSwitch
          name="is_active"
          label="Trạng thái hoạt động"
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
      </ModalForm>

      <Modal open={!!viewing} title={viewing?.name_app || 'Chi tiết ứng dụng'} footer={null} onCancel={() => setViewing(null)}>
        {viewing && (
          <ProDescriptions
            column={1}
            dataSource={{ ...viewing, status: viewing.is_active ? 'active' : 'inactive' }}
            columns={[
              { title: 'ID', dataIndex: 'id' },
              { title: 'Tên ứng dụng', dataIndex: 'name_app' },
              { title: 'Đường dẫn', dataIndex: 'link_app', copyable: true },
              { title: 'Trạng thái', dataIndex: 'status', valueEnum: STATUS_ENUM },
              { title: 'Ngày tạo', dataIndex: 'created_at', render: () => formatDateTime(viewing.created_at) },
              { title: 'Ngày cập nhật', dataIndex: 'updated_at', render: () => formatDateTime(viewing.updated_at) },
            ]}
          />
        )}
      </Modal>
    </PageContainer>
  );
}

function StatusFilter({ value, onChange }) {
  return (
    <Space>
      {[
        { label: 'Tất cả', value: undefined },
        { label: STATUS_ENUM.active.text, value: 'active' },
        { label: STATUS_ENUM.inactive.text, value: 'inactive' },
      ].map((opt) => (
        <Button
          key={opt.label}
          size="small"
          type={value === opt.value ? 'primary' : 'default'}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </Space>
  );
}
