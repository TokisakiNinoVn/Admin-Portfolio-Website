'use client';

import '@ant-design/v5-patch-for-react-19';
import { App, ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';

dayjs.locale('vi');

const THEME_KEY = 'theme';
const THEME_EVENT = 'theme-change';

const ThemeModeContext = createContext({ isDark: false, toggle: () => {} });

export const useThemeMode = () => useContext(ThemeModeContext);

const subscribeTheme = (callback) => {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
};

const readIsDark = () => {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark';
  } catch {
    return false;
  }
};

export default function Providers({ children }) {
  const isDark = useSyncExternalStore(subscribeTheme, readIsDark, () => false);

  const toggle = useCallback(() => {
    try {
      localStorage.setItem(THEME_KEY, readIsDark() ? 'light' : 'dark');
    } catch {
      // localStorage không khả dụng
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const themeMode = useMemo(() => ({ isDark, toggle }), [isDark, toggle]);

  return (
    <ThemeModeContext.Provider value={themeMode}>
      <ConfigProvider
        locale={viVN}
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#696cff',
            fontFamily: 'var(--font-be-vietnam-pro), sans-serif',
            borderRadius: 8,
          },
        }}
      >
        <App>{children}</App>
      </ConfigProvider>
    </ThemeModeContext.Provider>
  );
}
