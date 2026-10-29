'use client';

import CurriculumVitaeService from '@/services/curriculum-vitae.service';
import { PageContainer } from '@ant-design/pro-components';
import { App } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CvForm, { emptyGroup } from '../_components/CvForm';

const defaultValues = () => ({
  slug: '',
  template: 'template-1',
  full_name: 'Tokisaki Nino',
  avatar: { url: '', path: '' },
  title: 'Developer Fullstack',
  phone: '0867xxxxxx',
  email: 'tokisaki.nino.devstudio@gmail.com',
  address: 'Thái Nguyên, Việt Nam.',
  gender: 'Nam',
  birthday: '2004-02-11',
  social_links: [
    { name: 'Facebook', link: 'https://www.facebook.com/TokisakiNino' },
    { name: 'Github', link: 'https://github.com/TokisakiNinoVn' },
  ],
  groups_event: [emptyGroup()],
});

export default function CvCreatePage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [slugs, setSlugs] = useState([]);

  useEffect(() => {
    CurriculumVitaeService.list()
      .then((data) => setSlugs((data || []).map((cv) => cv.slug)))
      .catch((error) => console.error('Error fetching curriculumVitae:', error));
  }, []);

  const handleSubmit = async (payload) => {
    await CurriculumVitaeService.create(payload);
    message.success('Tạo CV thành công!');
    router.push('/curriculum-vitae');
  };

  return (
    <PageContainer title="Thêm CV mới" onBack={() => router.push('/curriculum-vitae')}>
      <CvForm initialValues={defaultValues()} otherSlugs={slugs} onSubmit={handleSubmit} />
    </PageContainer>
  );
}
