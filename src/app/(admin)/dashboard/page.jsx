'use client';

import DashboardService from '@/services/dashboard.service';
import { PageContainer, StatisticCard } from '@ant-design/pro-components';
import { Col, Row } from 'antd';
import { AppWindow, Brain, FileText, LayoutGrid, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const STATS = [
  { key: 'skill_categories', title: 'Danh mục kỹ năng', href: '/categories-skill', Icon: LayoutGrid },
  { key: 'skills', title: 'Kỹ năng', href: '/skills', Icon: Brain },
  { key: 'curriculum_vitae', title: 'CV', href: '/curriculum-vitae', Icon: FileText },
  { key: 'friends', title: 'Bạn bè', href: '/friends', Icon: Users },
  { key: 'app_settings', title: 'Ứng dụng', href: '/app-settings', Icon: AppWindow },
];

export default function DashboardPage() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DashboardService.counts()
      .then(setCounts)
      .catch((error) => console.error('Error fetching dashboard counts:', error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer title="Thống kê chung">
      <Row gutter={[16, 16]}>
        {STATS.map(({ key, title, href, Icon }) => (
          <Col key={key} xs={24} sm={12} lg={8} xl={6}>
            <Link href={href}>
              <StatisticCard
                hoverable
                loading={loading}
                statistic={{
                  title,
                  value: counts[key] ?? 0,
                  icon: <Icon size={32} strokeWidth={1.5} color="#696cff" />,
                }}
              />
            </Link>
          </Col>
        ))}
      </Row>
    </PageContainer>
  );
}
