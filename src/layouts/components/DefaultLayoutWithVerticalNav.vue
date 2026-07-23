<script setup>
import Footer from '@/layouts/components/Footer.vue';
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue';
import NavItems from '@/layouts/components/NavItems.vue';
import UserProfile from '@/layouts/components/UserProfile.vue';
import VerticalNavLayout from '@layouts/components/VerticalNavLayout.vue';
</script>

<template>
  <VerticalNavLayout>
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <!-- 👉 Vertical nav toggle in overlay mode -->
        <IconBtn
          class="ms-n3 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon icon="bx-menu" />
        </IconBtn>

        <!-- 👉 Search -->
        <!-- <div
          class="d-flex align-center cursor-pointer ms-lg-n3"
          style="user-select: none;"
        >
          <IconBtn>
            <VIcon icon="bx-search" />
          </IconBtn>

          <span class="d-none d-md-flex align-center text-disabled ms-2">
            <span class="me-2">Search</span>
            <span class="meta-key">&#8984;K</span>
          </span>
        </div> -->

        <VSpacer />

        <IconBtn>
          <router-link to="/notifications">
            <VIcon class="icon-notification" icon="bx-bell" />
          </router-link>
        </IconBtn>

        <NavbarThemeSwitcher class="me-1" />
          <!-- <div class="mr-4"></div> -->

        <UserProfile />
      </div>
    </template>

    <template #vertical-nav-header="{ toggleIsOverlayNavActive }">
      <div
        class="app-logo app-title-wrapper"
      >
      <RouterLink
        to="/"
        class="app-logo app-title-wrapper"
      >
      
        <img src="@/assets/images/logos/logo.jpg" class="logo-image mb-3" alt="">
      </RouterLink>

        <a href="https://tokisakinino.com" target="_blank" class="mb-2">
          <span class="link-web"><i class="fa-solid fa-link"></i>tokisakinino.com</span>
        </a>
      </div>

      <IconBtn
        class="d-block d-lg-none"
        @click="toggleIsOverlayNavActive(false)"
      >
        <VIcon icon="bx-x" />
      </IconBtn>
    </template>

    <template #vertical-nav-content>
      <NavItems />
    </template>

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>
  </VerticalNavLayout>
</template>

<style lang="scss" scoped>
.meta-key {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  block-size: 1.5625rem;
  line-height: 1.3125rem;
  padding-block: 0.125rem;
  padding-inline: 0.25rem;
}

.link-web {
  font-size: 15px;
  margin-top: 10px;
  color: rgba(23, 82, 134);
  background-color: rgb(231, 240, 249);
  border-radius: 20px;
  padding: 6px 16px;
  font-weight: 600;
}
.link-web i {
  margin-right: 5px;
  font-size: 14px;
}

.icon-notification {
  color: black;
}

.app-logo {
  display: flex;
  align-items: center;
  column-gap: 0.75rem;
  flex-direction: column;
  width: 100%;
  margin-bottom: 10px;

  .app-logo-title {
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.75rem;
    margin-bottom: 10px;
  }
}

.logo-image {
  width: 130px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
