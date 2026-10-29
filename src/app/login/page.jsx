'use client';

import AuthService from '@/services/auth.service';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { App, theme } from 'antd';
import { Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const REMEMBER_EMAIL_KEY = 'remember_email';

export default function LoginPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const formRef = useRef();

  useEffect(() => {
    AuthService.getSession()
      .then((session) => {
        if (session) router.replace('/dashboard');
      })
      .catch(() => {});

    try {
      const email = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (email) formRef.current?.setFieldsValue({ email, remember: true });
    } catch {
      // localStorage không khả dụng
    }
  }, [router]);

  const handleLogin = async ({ email, password, remember }) => {
    try {
      await AuthService.signInWithPassword(email, password);

      try {
        if (remember) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, email);
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
      } catch {
        // localStorage không khả dụng
      }

      message.success('Đăng nhập thành công!');
      router.replace('/dashboard');
    } catch (error) {
      console.error('Đăng nhập thất bại:', error);
      message.error(error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <div
      className="full-center"
      style={{
        padding: 16,
        background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgLayout} 100%)`,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: token.colorBgContainer,
          borderRadius: 16,
          boxShadow: token.boxShadowSecondary,
          paddingBlock: 24,
        }}
      >
        <LoginForm
          formRef={formRef}
          logo="/images/logo.jpg"
          title="Tokisaki Nino"
          subTitle="Đăng nhập trang quản trị"
          submitter={{ searchConfig: { submitText: 'Đăng nhập' } }}
          onFinish={handleLogin}
        >
          <ProFormText
            name="email"
            fieldProps={{ size: 'large', prefix: <Mail size={16} />, autoFocus: true }}
            placeholder="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{ size: 'large', prefix: <Lock size={16} />, autoComplete: 'current-password' }}
            placeholder="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          />
          <div style={{ marginBottom: 24 }}>
            <ProFormCheckbox noStyle name="remember">
              Ghi nhớ email
            </ProFormCheckbox>
          </div>
        </LoginForm>
      </div>
    </div>
  );
}
