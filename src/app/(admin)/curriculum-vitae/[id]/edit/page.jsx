'use client';

import CurriculumVitaeService from '@/services/curriculum-vitae.service';
import { PageContainer } from '@ant-design/pro-components';
import { App, Result, Spin } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CvForm, { emptyEvent } from '../../_components/CvForm';

// Chuẩn hoá dữ liệu CV từ DB về dạng form
const toFormValues = (cv) => ({
  ...cv,
  avatar: { url: cv.avatar || '', path: cv.avatar || '' },
  social_links: Array.isArray(cv.social_links) ? cv.social_links : [],
  groups_event: (Array.isArray(cv.groups_event) ? cv.groups_event : []).map((group) => ({
    ...group,
    events: Array.isArray(group.events) ? group.events : [emptyEvent()],
  })),
});

export default function CvEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const [cv, setCv] = useState(undefined);
  const [slugs, setSlugs] = useState([]);

  useEffect(() => {
    Promise.all([CurriculumVitaeService.get(id), CurriculumVitaeService.list()])
      .then(([result, all]) => {
        const found = Array.isArray(result) ? result[0] : result;
        setCv(found ?? null);
        setSlugs((all || []).filter((item) => String(item.id) !== String(id)).map((item) => item.slug));
      })
      .catch((error) => {
        console.error('Error fetching CV:', error);
        message.error('Lỗi khi tải dữ liệu CV');
        setCv(null);
      });
  }, [id, message]);

  const handleSubmit = async (payload) => {
    await CurriculumVitaeService.update(id, payload);
    message.success('Cập nhật CV thành công!');
    router.push('/curriculum-vitae');
  };

  return (
    <PageContainer title="Chỉnh sửa CV" onBack={() => router.push('/curriculum-vitae')}>
      {cv === undefined && <Spin size="large" style={{ display: 'block', margin: '64px auto' }} />}
      {cv === null && <Result status="404" title="Không tìm thấy dữ liệu CV" />}
      {cv && (
        <CvForm initialValues={toFormValues(cv)} otherSlugs={slugs} submitText="Cập nhật" onSubmit={handleSubmit} />
      )}
    </PageContainer>
  );
}
