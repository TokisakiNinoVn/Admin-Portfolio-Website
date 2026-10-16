<script setup>
import pages1 from '@images/pages/1.png';

</script>

<template>
  <VRow>
    <VCol
      cols="12"
      sm="6"
      md="3"
    >
      <VCard>
        <VImg
          :src="pages1"
          cover
        />

        <VCardItem>
          <VCardTitle>Influencing The Influencer</VCardTitle>
        </VCardItem>

        <VCardText>
          Cancun is back, better than ever! Over a hundred Mexico resorts have reopened and the state tourism minister predicts Cancun will draw as many visitors in 2006 as it did two years ago.
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
.lesson-card {
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
}
</style>
