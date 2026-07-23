<script setup>
import { dashboardInforApi } from '@/apis/modules/dashboard.api';
import { onMounted, ref } from 'vue';

const dashboardInfor = ref({})
const inforUserLocalStorage = JSON.parse(localStorage.getItem('user'))
const isLoading = ref(true)

const getDashboardInfor = async () => {
  try {
    const response = await dashboardInforApi()
    dashboardInfor.value = response.data.data
  } catch (error) {
    console.error('Error fetching dashboard infor:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // getDashboardInfor()
})
</script>

<template>
  <div class="dashboard-container">
    
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header styles */
.dashboard-header {
  background: linear-gradient(135deg, rgba(23, 82, 134, 0.8), rgba(23, 82, 134));
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  color: white;
  box-shadow: 0 10px 30px rgba(41, 98, 255, 0.15);
}

.teacher-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24px;
  font-size: 32px;
}

.info h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: white;
}

.info p {
  margin: 0 0 16px 0;
  opacity: 0.9;
}

.stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

/* Layout grid */
.dashboard-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 32px;
}

.dashboard-col {
  flex: 1 1 100%;
}

.col-sm-6 {
  flex: 1 1 calc(50% - 24px);
}

.col-md-4 {
  flex: 1 1 calc(33.333% - 24px);
}

.col-lg-3 {
  flex: 1 1 calc(25% - 24px);
}

.dashboard-link {
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
}

/* Card styles */
.dashboard-card {
  transition: all 0.3s ease;
  border-radius: 16px;
  padding: 24px;
  height: 140px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4a90e2, #5bc0be);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(25, 118, 210, 0.18);
  cursor: pointer;
}

.dashboard-card:hover::before {
  opacity: 1;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: rgba(74, 144, 226, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
  color: #4a90e2;
  transition: all 0.3s ease;
}

.dashboard-card:hover .card-icon {
  background: rgba(74, 144, 226, 0.2);
  transform: scale(1.1);
}

.card-content {
  flex: 1;
}

/* Title */
.dashboard-card-title {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 16px;
  color: black;
}

.dashboard-card-text {
  color: #546e7a;
  font-size: 14px;
  line-height: 1.5;
}

/* Section Titles */
h2 {
  margin: 0 0 16px 0;
  color: black;
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
}

.mr-2 {
  margin-right: 10px;
}

/* Skeleton loading */
.skeleton-loading {
  padding: 20px;
}

.skeleton-header {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
}

.skeleton-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e0e0e0;
  margin-right: 24px;
}

.skeleton-info {
  flex: 1;
}

.skeleton-title {
  height: 24px;
  width: 200px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-text {
  height: 16px;
  width: 150px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 16px;
}

.skeleton-stats {
  display: flex;
  gap: 24px;
}

.skeleton-stat {
  height: 20px;
  width: 80px;
  background: #e0e0e0;
  border-radius: 4px;
}

.skeleton-section {
  height: 20px;
  width: 200px;
  background: #e0e0e0;
  border-radius: 4px;
  margin: 32px 0 16px;
}

.skeleton-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 32px;
}

.skeleton-card {
  height: 140px;
  flex: 1 1 calc(25% - 24px);
  background: #e0e0e0;
  border-radius: 16px;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .col-lg-3 {
    flex: 1 1 calc(33.333% - 24px);
  }
}

@media (max-width: 992px) {
  .col-md-4 {
    flex: 1 1 calc(50% - 24px);
  }
  
  .teacher-info {
    flex-direction: column;
    text-align: center;
  }
  
  .avatar {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .stats {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 12px;
  }
  
  .dashboard-card {
    height: 120px;
    padding: 18px;
  }
  
  .dashboard-row {
    gap: 16px;
  }
  
  .col-sm-6 {
    flex: 1 1 100%;
  }
  
  .card-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-item {
    align-items: center;
  }
}

@media (max-width: 576px) {
  .dashboard-header {
    padding: 16px;
  }
  
  .avatar {
    width: 60px;
    height: 60px;
    font-size: 24px;
  }
  
  .info h1 {
    font-size: 20px;
  }
}
</style>
