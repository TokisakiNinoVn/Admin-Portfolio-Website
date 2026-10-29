import {
  Brain,
  BookOpen,
  FileText,
  Folder,
  Heart,
  LayoutGrid,
  Mail,
  PieChart,
  Settings,
  User,
  UserCog,
  Users,
} from 'lucide-react';

const icon = (Icon) => <Icon size={16} />;

export const menuRoute = {
  path: '/',
  routes: [
    {
      name: 'Tổng quan',
      path: '/overview',
      routes: [{ path: '/dashboard', name: 'Thống kê chung', icon: icon(PieChart) }],
    },
    {
      name: 'Website Portfolio',
      path: '/portfolio',
      routes: [
        { path: '/friends', name: 'Friends', icon: icon(Users) },
        { path: '/dating', name: 'Dating', icon: icon(Heart) },
        { path: '/contact', name: 'Contact', icon: icon(Mail) },
        { path: '/blogs', name: 'Blogs', icon: icon(BookOpen) },
        { path: '/about', name: 'Thông tin', icon: icon(User) },
        { path: '/projects', name: 'Projects', icon: icon(Folder) },
      ],
    },
    {
      name: 'Quản lý CV',
      path: '/cv',
      routes: [
        { path: '/categories-skill', name: 'Categories Skill', icon: icon(LayoutGrid) },
        { path: '/skills', name: 'Skills', icon: icon(Brain) },
        { path: '/curriculum-vitae', name: 'CVs', icon: icon(FileText) },
      ],
    },
    {
      name: 'Hệ thống',
      path: '/system',
      routes: [
        { path: '/account-settings', name: 'Cài đặt tài khoản', icon: icon(UserCog) },
        { path: '/app-settings', name: 'Cấu hình Ứng dụng', icon: icon(Settings) },
      ],
    },
  ],
};
