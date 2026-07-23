<template>
  <div class="popup-overlay" @click.self="$emit('close')">
    <div class="popup">
      <!-- Header -->
      <div class="popup-header">
        <h2 class="popup-title">Hồ sơ học sinh</h2>
        <button class="close-btn" @click="$emit('close')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="!detailStudent" class="loading-state">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>

      <template v-else>
        <!-- Student Info -->
        <div class="student-card">
          <img :src="detailStudent.avatar" :alt="detailStudent.name" class="avatar" />
          <div class="student-info">
            <h3 class="student-name">{{ detailStudent.name }}</h3>
            <div class="info-row">
              <span class="info-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                {{ detailStudent.school?.name }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-badge teal">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                {{ detailStudent.grade?.name }}
              </span>
              <span class="info-badge indigo">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                {{ detailStudent.class?.name }}
              </span>
            </div>
            <div class="info-row meta">
              <span>
                <i class="fa-solid fa-envelope"></i>
                {{ detailStudent.email }}
                <button
                  class="copy-btn"
                  @click="copyText(detailStudent.email)"
                  title="Copy email"
                >
                  <i class="fa-regular fa-copy"></i>
                </button>
              </span>

              <span>
                <i class="fa-solid fa-phone"></i>
                {{ detailStudent.phone }}
                <button
                  class="copy-btn"
                  @click="copyText(detailStudent.phone)"
                  title="Copy phone"
                >
                  <i class="fa-regular fa-copy"></i>
                </button>
              </span>
            </div>

          </div>
        </div>

        <!-- Controls -->
        <div class="controls-bar">
          <div class="select-wrapper">
            <label>Loại điểm</label>
            <select v-model="scoreType" @change="renderChart">
              <option value="unit_scores">Điểm Unit</option>
              <option value="lesson_scores">Điểm Bài học</option>
              <option value="test_scores">Điểm Kiểm tra</option>
            </select>
          </div>
          <div class="select-wrapper">
            <label>Số bài hiển thị</label>
            <select v-model="displayLimit" @change="renderChart">
              <option :value="10">10 bài gần nhất</option>
              <option :value="20">20 bài gần nhất</option>
              <option :value="50">50 bài gần nhất</option>
            </select>
          </div>
        </div>

        <!-- Chart -->
        <div class="chart-section">
          <h4 class="section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Biểu đồ điểm số
          </h4>
          <div id="scoreChart" ref="chartRef"></div>
        </div>

        <!-- History List -->
        <div class="history-section">
          <h4 class="section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Lịch sử làm bài
          </h4>
          <div class="history-list">
            <div
              v-for="(item, index) in historyItems"
              :key="item.id"
              class="history-item"
            >
              <div class="history-index">{{ index + 1 }}</div>
              <div class="history-body">
                <div class="history-top">
                  <span class="history-label">{{ getItemLabel(item) }}</span>
                  <span class="score-chip" :class="getScoreClass(getMainScore(item))">
                    {{ getMainScore(item).toFixed(1) }}
                  </span>
                </div>
                <div class="history-sub">
                  <span><i class="fa-solid fa-bullseye"></i> Chính xác: {{ item.data?.AccuracyScore?.toFixed(1) ?? '—' }}</span>
                  <span><i class="fa-solid fa-location-crosshairs"></i> Lưu loát: {{ item.data?.FluencyScore?.toFixed(1) ?? '—' }}</span>
                  <span><i class="fa-solid fa-circle-check"></i> Hoàn thành: {{ item.data?.CompletenessScore?.toFixed(1) ?? '—' }}</span>
                </div>
                <div class="history-date">{{ formatDate(item.created_at) }}</div>
              </div>
            </div>
            <div v-if="historyItems.length === 0" class="empty-state">Không có dữ liệu</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { detailStudentApi } from "@/apis/modules/class.api";
import { useToast } from "@/stores/toast.store";
import ApexCharts from 'apexcharts';
import { computed, nextTick, onMounted, ref } from "vue";

const props = defineProps({
  id: Number
})
const toast = useToast();
const detailStudent = ref(null)
const scoreType = ref('unit_scores')
const displayLimit = ref(10)
const chartRef = ref(null)
let chartInstance = null

const copyText = async (text) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    toast.show("Copied thành công!", "success");
  } catch (err) {
    toast.show("Copied lỗi!", "success");
  }
}

const fetchDetailStudent = async () => {
  try {
    const res = await detailStudentApi(props.id)
    detailStudent.value = res.data.data ?? res.data
    await nextTick()
    renderChart()
  } catch (err) {
    console.error(err)
  }
}

const getMainScore = (item) => {
  if (scoreType.value === 'unit_scores') return item.data?.average_score ?? 0
  return item.data?.OverallScore ?? item.score ?? 0
}

const getItemLabel = (item) => {
  if (scoreType.value === 'unit_scores') return `Unit #${item.unit_id}`
  if (scoreType.value === 'lesson_scores') return `Bài học #${item.lesson_id} (Unit ${item.unit_id})`
  return `Kiểm tra #${item.test_id}`
}

const getScoreClass = (score) => {
  if (score >= 85) return 'green'
  if (score >= 70) return 'yellow'
  return 'red'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const currentScores = computed(() => {
  if (!detailStudent.value) return []
  const scores = detailStudent.value.scores?.[scoreType.value] ?? []
  return [...scores].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, displayLimit.value)
})

const historyItems = computed(() => currentScores.value)

const renderChart = async () => {
  await nextTick()
  if (!chartRef.value) return

  const items = [...currentScores.value].reverse()

  const isUnit = scoreType.value === 'unit_scores'

  const categories = items.map((item, i) => {
    if (isUnit) return `Unit ${item.unit_id}`
    if (scoreType.value === 'lesson_scores') return `Bài ${item.lesson_id}`
    return `KT ${item.test_id}`
  })

  const overallData = items.map(item => isUnit ? (item.data?.average_score ?? 0) : (item.data?.OverallScore ?? item.score ?? 0))

  const series = isUnit
    ? [{ name: 'Điểm trung bình', data: overallData }]
    : [
        { name: 'OverallScore', data: overallData },
        { name: 'AccuracyScore', data: items.map(i => i.data?.AccuracyScore ?? 0) },
        { name: 'FluencyScore', data: items.map(i => i.data?.FluencyScore ?? 0) },
        { name: 'CompletenessScore', data: items.map(i => i.data?.CompletenessScore ?? 0) },
      ]

  const options = {
  series, // thêm dòng này
  chart: {
    type: 'line',
    height: 260,
    toolbar: { show: false },
    fontFamily: 'inherit',
    animations: { enabled: true, speed: 600 },
    background: 'transparent',
  },
  colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444'],
  stroke: { curve: 'smooth', width: 2.5 },
  markers: { size: 5, strokeWidth: 0, hover: { size: 7 } },
  xaxis: {
    categories,
    labels: { style: { fontSize: '11px', colors: '#6b7280' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    min: 0,
    max: 100,
    labels: { style: { fontSize: '11px', colors: '#6b7280' } },
  },
  grid: { borderColor: '#f0f0f0', strokeDashArray: 4 },
  legend: { show: !isUnit, position: 'top', fontSize: '12px' },
  tooltip: {
    y: { formatter: (val) => val?.toFixed(2) }
  },
}


  if (chartInstance) {
    chartInstance.destroy()
  }
  chartInstance = new ApexCharts(chartRef.value, options)
  chartInstance.render()
}

onMounted(() => {
  fetchDetailStudent()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap');
.copy-btn {
  margin-left: 6px;
  border: none;
  background: rgb(156, 230, 156);
  cursor: pointer;
  color: #888;
  padding: 8px 12px;
  border-radius: 50%;
}

.copy-btn:hover {
  color: #333;
}

* { box-sizing: border-box; }

.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  padding: 16px;
}

.popup {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0,0,0,0.18);
  font-family: 'Be Vietnam Pro', sans-serif;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 0;
  position: sticky;
  top: 0;
  background: linear-gradient(45deg,rgba(34, 86, 135, 1) 0%, rgba(255, 255, 255, 1) 100%);
  z-index: 10;
  border-radius: 16px 16px 0 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.popup-title {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.3px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.15s;
}
.close-btn:hover { background: #fee2e2; border-color: #fca5a5; color: #ef4444; }

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 24px;
  color: #94a3b8;
  font-size: 14px;
}
.spinner {
  width: 32px; height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Student Card */
.student-card {
  display: flex;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
  border-bottom: 1px solid #e8edf8;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid #c7d2fe;
  flex-shrink: 0;
}

.student-info { flex: 1; min-width: 0; }

.student-name {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
  letter-spacing: -0.3px;
}

.info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 6px;
}

.info-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 500;
  color: #4b5563;
  background: #fff;
  border: 1px solid #e2e8f0;
  padding: 3px 9px;
  border-radius: 20px;
}
.info-badge.teal { color: #0f766e; background: #f0fdfa; border-color: #99f6e4; }
.info-badge.indigo { color: #4338ca; background: #eef2ff; border-color: #c7d2fe; }

.info-row.meta {
  gap: 14px;
  margin-top: 4px;
}
.info-row.meta span {
  font-size: 12px;
  color: #6b7280;
}

/* Controls */
.controls-bar {
  display: flex;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}

.select-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 160px;
}

.select-wrapper label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.select-wrapper select {
  height: 36px;
  padding: 0 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  color: #1e293b;
  background: #fff;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
}
.select-wrapper select:focus { border-color: #6366f1; }

/* Sections */
.chart-section, .history-section {
  padding: 20px 24px;
}
.chart-section { border-bottom: 1px solid #f1f5f9; }

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 7px;
  letter-spacing: -0.2px;
}
.section-title svg { color: #6366f1; }

/* History List */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
  background: #fafafa;
  transition: all 0.15s;
}
.history-item:hover { border-color: #c7d2fe; background: #f8f9ff; }

.history-index {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #eef2ff;
  color: #6366f1;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.history-body { flex: 1; min-width: 0; }

.history-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.history-label {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.score-chip {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
  white-space: nowrap;
}
.score-chip.green { background: #dcfce7; color: #15803d; }
.score-chip.yellow { background: #fef9c3; color: #a16207; }
.score-chip.red { background: #fee2e2; color: #dc2626; }

.history-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 11.5px;
  color: #6b7280;
  margin-bottom: 5px;
}

.history-date {
  font-size: 11px;
  color: #94a3b8;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: #94a3b8;
  font-size: 14px;
}
</style>
