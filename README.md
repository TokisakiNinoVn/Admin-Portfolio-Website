# Admin Portfolio Website

Trang quản trị cho website portfolio của Tokisaki Nino, viết bằng **Next.js (App Router)**, **Ant Design 5**, **@ant-design/pro-components** và **lucide-react**. Dữ liệu lưu trên **Supabase**.

## Cài đặt

```sh
npm install
cp .env.example .env.local   # điền NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Lệnh

```sh
npm run dev     # chạy môi trường phát triển (http://localhost:3000)
npm run build   # build production
npm run start   # chạy bản build ở cổng 5050
npm run lint    # kiểm tra ESLint
```

## Cấu trúc

```
src/
  app/
    layout.jsx, providers.jsx   # AntdRegistry, ConfigProvider (vi_VN, sáng/tối)
    login/                      # đăng nhập Supabase (chỉ tài khoản role = admin)
    (admin)/                    # ProLayout + kiểm tra phiên đăng nhập
      dashboard/ categories-skill/ skills/ friends/ app-settings/
      curriculum-vitae/         # danh sách, /create, /[id]/edit
  components/                   # RowActions, RichTextEditor (Tiptap), AvatarUpload, Sortable (dnd-kit)
  lib/supabase.js               # Supabase client
  services/                     # truy vấn Supabase theo từng bảng
  utils/
```
