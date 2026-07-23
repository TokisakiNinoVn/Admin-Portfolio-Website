<script setup>
const props = defineProps({
  item: {
    type: null,
    required: true,
  },
})
</script>

<template>
  <li class="nav-section-title">
    <div class="title-wrapper">
      <span
        class="title-text"
        v-text="item.heading"
      />
    </div>
  </li>
</template>

<style lang="scss">
.title-text {
  font-size: 14px;
  font-weight: bold;
  line-height: 1.5rem;
  text-transform: uppercase;
  color: black;
}

// .nav-section-title {
//   margin: 10px auto !important;
// }
</style>
