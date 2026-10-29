'use client';

import { useThemeMode } from '@/app/providers';
import AuthService from '@/services/auth.service';
import { ProLayout } from '@ant-design/pro-components';
import { App, Button, Dropdown, Spin, Tooltip } from 'antd';
import { LogOut, Moon, Sun, UserCog } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { menuRoute } from './menu';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { modal, message } = App.useApp();
  const { isDark, toggle } = useThemeMode();
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    let active = true;

    AuthService.getSession()
      .then((s) => active && setSession(s))
      .catch(() => active && setSession(null));

    const unsubscribe = AuthService.onAuthStateChange((_event, s) => {
      if (active) setSession(s);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session === null) router.replace('/login');
  }, [session, router]);

  if (!session) {
    return (
      <div className="full-center">
        <Spin size="large" />
      </div>
    );
  }

  const user = session.user;
  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email;

  const confirmLogout = () => {
    modal.confirm({
      title: 'Xác nhận',
      content: 'Bạn có chắc chắn muốn đăng xuất?',
      okText: 'Đăng xuất',
      okButtonProps: { danger: true },
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await AuthService.signOut();
          router.replace('/login');
        } catch (error) {
          console.error('Logout error:', error);
          message.error('Đăng xuất thất bại!');
        }
      },
    });
  };

  return (
    <ProLayout
      title="Tokisaki Nino"
      logo="/images/logo.jpg"
      layout="mix"
      fixSiderbar
      fixedHeader
      navTheme={isDark ? 'realDark' : 'light'}
      route={menuRoute}
      location={{ pathname }}
      menu={{ type: 'group' }}
      menuItemRender={(item, dom) => <Link href={item.path}>{dom}</Link>}
      onMenuHeaderClick={() => router.push('/dashboard')}
      actionsRender={() => [
        <Tooltip key="theme" title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}>
          <Button
            type="text"
            icon={isDark ? <Sun size={16} /> : <Moon size={16} />}
            onClick={toggle}
          />
        </Tooltip>,
      ]}
      avatarProps={{
        src: 'https://i.pinimg.com/736x/20/ef/6b/20ef6b554ea249790281e6677abc4160.jpg',
        title: displayName,
        size: 'small',
        render: (_props, dom) => (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'email',
                  label: user.email,
                  disabled: true,
                },
                { type: 'divider' },
                {
                  key: 'account',
                  icon: <UserCog size={16} />,
                  label: <Link href="/account-settings">Tài khoản</Link>,
                },
                {
                  key: 'logout',
                  icon: <LogOut size={16} />,
                  label: 'Đăng xuất',
                  danger: true,
                  onClick: confirmLogout,
                },
              ],
            }}
          >
            {dom}
          </Dropdown>
        ),
      }}
      footerRender={() => (
        <div style={{ padding: '16px 0', textAlign: 'center', opacity: 0.65 }}>
          Tokisaki Nino &copy; {new Date().getFullYear()}
        </div>
      )}
    >
      {children}
    </ProLayout>
  );
}
