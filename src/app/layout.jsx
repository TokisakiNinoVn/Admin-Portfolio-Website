import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
});

export const metadata = {
  title: 'Admin - Tokisaki Nino',
  icons: { icon: '/web-logo.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body>
        <AntdRegistry>
          <Providers>{children}</Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
