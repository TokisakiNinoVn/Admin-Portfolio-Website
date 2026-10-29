// src/utils/format.util.js

import dayjs from 'dayjs';

export const formatDate = (date) => {
  if (!date) return '—';
  const d = dayjs(date);

  return d.isValid() ? d.format('DD/MM/YYYY') : '—';
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  const d = dayjs(date);

  return d.isValid() ? d.format('DD/MM/YYYY HH:mm') : '—';
};

// Tạo slug từ chuỗi bất kỳ (bỏ dấu tiếng Việt)
export const generateSlug = (text = '') =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

// Dùng cho Form.Item chứa DatePicker nhưng lưu giá trị dạng chuỗi 'YYYY-MM-DD'
export const dateStringItemProps = {
  getValueProps: (value) => ({ value: value ? dayjs(value) : null }),
  normalize: (value) => (value ? value.format('YYYY-MM-DD') : ''),
};
