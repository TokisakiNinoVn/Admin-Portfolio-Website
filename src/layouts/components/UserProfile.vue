<template>
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    color="success"
    bordered
  >
    <VAvatar
      class="cursor-pointer"
      color="primary"
      variant="tonal"
    >
      <!-- <VImg :src="avatar1" /> -->
      <VImg src="https://i.pinimg.com/736x/20/ef/6b/20ef6b554ea249790281e6677abc4160.jpg" />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="280"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                  >
                    <!-- <VImg :src="avatar1" /> -->
                    <VImg src="https://i.pinimg.com/736x/20/ef/6b/20ef6b554ea249790281e6677abc4160.jpg" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold name-navbar">
              {{ user.name }}
            </VListItemTitle>
            <VListItemSubtitle>{{ user.email }}</VListItemSubtitle>
          </VListItem>
          <VDivider class="my-2" />

          <!-- 👉 Profile -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="bx-user"
                size="22"
              />
            </template>
              <router-link to="/account-settings" class="navigation-navbar">
                <VListItemTitle>
                  Tài khoản
                </VListItemTitle>
            </router-link>
          </VListItem>

          <VDivider class="my-2" />

          <!-- 👉 Logout -->
          <VListItem @click="showLogoutDialog = true">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="bx-log-out"
                size="22"
              />
            </template>
            <VListItemTitle>Đăng xuất</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>

  <!-- Dialog xác nhận đăng xuất -->
  <VDialog v-model="showLogoutDialog" max-width="400px">
    <VCard>
      <VCardTitle class="text-h6 ">Xác nhận</VCardTitle>
      <VCardText>Bạn có chắc chắn muốn đăng xuất?</VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn variant="text" color="grey" @click="showLogoutDialog = false">
          Hủy
        </VBtn>
        <VBtn variant="tonal" color="red" @click="logOut" class="btn-logout">
          Đăng xuất
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Lấy thông tin user từ localStorage
const storedUser = localStorage.getItem('user')
const user = storedUser ? JSON.parse(storedUser) : { name: 'Unknown', email: '', role: '' }

const showLogoutDialog = ref(false)
const router = useRouter()

function logOut() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('role')
  localStorage.removeItem('email')
  localStorage.setItem('isLoggedIn', 'false')

  showLogoutDialog.value = false
  router.push('/login')
}
</script>

<style lang="scss">
.name-navbar {
  white-space: nowrap;
  font-weight: 600 !important;
  width: max-content;
}

.btn-logout {
  background-color: red !important;
  color: white !important;
}

.navigation-navbar {
  color: black !important;
}
</style>
