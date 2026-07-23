<script setup>
import VerticalNavSectionTitle from '@/@layouts/components/VerticalNavSectionTitle.vue';
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue';
</script>

<template>
  <!-- 👉 Dashboard -->
  <VerticalNavLink
    :item="{
      title: 'Thống kê chung',
      icon: 'bx-pie-chart-alt',
      to: '/dashboard',
    }"
  />

  <VerticalNavSectionTitle
    :item="{
      heading: 'Website Portfolio',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Friends',
      icon: 'bx-group',
      to: '/friends',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Dating',
      icon: 'bx-heart',
      to: '/dating',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Contact',
      icon: 'bx-envelope',
      to: '/contact',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Blogs',
      icon: 'bx-book',
      to: '/blogs',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Thông tin',
      icon: 'bx-user',
      to: '/about',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Projects',
      icon: 'bx-folder',
      to: '/projects',
    }"
  />

  <VerticalNavSectionTitle
    :item="{
      heading: 'Quản lý CV',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Categories Skill',
      icon: 'bx-category',
      to: '/categories-skill',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Skills',
      icon: 'bx-brain',
      to: '/skills',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'CVs',
      icon: 'bx-user',
      to: '/curriculum-vitae',
    }"
  />

  <!-- 👉 Academic Management -->
  <!-- <VerticalNavSectionTitle
    :item="{
      heading: 'Học tập & Giảng dạy',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Bài học',
      icon: 'bx-book-content',
      to: '/lessons',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Chủ đề thi',
      icon: 'bx-category-alt',
      to: '/exam-topics',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Ngân hàng câu hỏi',
      icon: 'bx-library',
      to: '/question-bank',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Rubric chấm điểm',
      icon: 'bx-task',
      to: '/rubrics',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Đề kiểm tra',
      icon: 'bx-flag',
      to: '/campaigns',
    }"
  /> -->

  <!-- <VerticalNavLink
    :item="{
      title: 'Đề thi',
      icon: 'bx-file',
      to: '/papers',
    }"
  /> -->
<!-- 
  <VerticalNavLink
    :item="{
      title: 'Chấm điểm',
      icon: 'bx-check-shield',
      to: '/grading',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Tạo bộ đề',
      icon: 'bx-analyse',
      to: '/practices',
    }"
  /> -->

  <!-- 👉 System -->
  <VerticalNavSectionTitle
    :item="{
      heading: 'Hệ thống',
    }"
  />

  <!-- <VerticalNavLink
    :item="{
      title: 'Thông báo',
      icon: 'bx-bell',
      to: '/notifications',
    }"
  /> -->

  <VerticalNavLink
    :item="{
      title: 'Cài đặt tài khoản',
      icon: 'bx-user',
      to: '/account-settings',
    }"
  />
</template>
