'use client';

import { Button, Popconfirm, Space, Tooltip } from 'antd';
import { Eye, Pencil, Trash2 } from 'lucide-react';

// Bộ nút Xem / Sửa / Xoá dùng chung cho các bảng & thẻ
export default function RowActions({ onView, onEdit, onDelete, deleteTitle, viewTitle = 'Xem chi tiết' }) {
  return (
    <Space size={0}>
      {onView && (
        <Tooltip title={viewTitle}>
          <Button type="text" size="small" icon={<Eye size={16} />} onClick={onView} />
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip title="Sửa">
          <Button type="text" size="small" icon={<Pencil size={16} />} onClick={onEdit} />
        </Tooltip>
      )}
      {onDelete && (
        <Popconfirm
          title="Xác nhận xóa"
          description={deleteTitle}
          okText="Xóa"
          okButtonProps={{ danger: true }}
          cancelText="Hủy"
          onConfirm={onDelete}
        >
          <Tooltip title="Xoá">
            <Button type="text" size="small" danger icon={<Trash2 size={16} />} />
          </Tooltip>
        </Popconfirm>
      )}
    </Space>
  );
}
