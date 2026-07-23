<template>
  <v-container fluid class="pa-4">

    <!-- ==================== CLASS LIST VIEW ==================== -->
    <div v-if="currentView === 'classList'">

      <!-- Header -->
      <div class="page-header mb-5">
        <div>
          <h1 class="page-title">
            <i class="fa-solid fa-chalkboard-teacher mr-2"></i>
            Danh sách lớp học
          </h1>
          <p class="page-subtitle">Quản lý và theo dõi tiến độ học sinh</p>
        </div>
        <div class="header-stats">
          <div class="stat-pill">
            <span class="stat-num">{{ classes.length }}</span>
            <span class="stat-label">Lớp học</span>
          </div>
          <div class="stat-pill">
            <span class="stat-num">{{ totalStudents }}</span>
            <span class="stat-label">Học sinh</span>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="search-bar-wrap mb-4">
        <i class="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Tìm kiếm theo tên lớp..."
        />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- No result -->
      <div v-if="filteredClasses.length === 0" class="empty-state">
        <i class="fa-solid fa-folder-open"></i>
        <p>Không tìm thấy lớp nào phù hợp</p>
      </div>

      <!-- Class List -->
      <div class="class-list-wrap" v-else>
        <div
          v-for="classItem in filteredClasses"
          :key="classItem.id"
          class="class-list-item"
          :style="{ borderLeftColor: getClassColor(classItem.id) }"
        >
          <!-- Left: color dot + name -->
          <div class="cli-main">
            <div class="cli-dot" :style="{ background: getClassColor(classItem.id) }"></div>
            <div class="cli-info">
              <span class="cli-name">{{ classItem.name }}</span>
              <span class="cli-meta">
                <i class="fa-solid fa-users mr-1"></i>{{ classItem.total_students }} học sinh
              </span>
            </div>
          </div>

          <!-- Middle: progress bar -->
          <div class="cli-progress">
            <div class="cli-progress-label">
              <span class="cli-progress-text">Điểm TB</span>
              <span class="cli-progress-val" :class="getScoreBadgeClass100(classItem.average_score)">
                {{ classItem.average_score > 0 ? (classItem.average_score) : '—' }}
              </span>
            </div>
            <div class="progress-bar-bg">
              <div
                class="progress-bar-fill"
                :style="{
                  width: classItem.average_score > 0 ? `${classItem.average_score * 10}%` : '0%',
                  background: getClassColor(classItem.id)
                }"
              ></div>
            </div>
          </div>

          <!-- Right: button -->
          <button class="btn-detail" @click.stop="manageClass(classItem)">
            <i class="fa-solid fa-arrow-right"></i>
            Chi tiết
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== CLASS DETAIL VIEW ==================== -->
    <div v-else-if="currentView === 'classDetail' && selectedClassForDetail">

      <!-- Back + Title -->
      <div class="detail-header mb-5">
        <button class="btn-back" @click="backToClassList">
          <i class="fa-solid fa-arrow-left mr-1"></i>
          Quay lại
        </button>
        <div class="detail-title-block">
          <div class="detail-class-dot" :style="{ background: getClassColor(selectedClassForDetail.id) }"></div>
          <div>
            <h1 class="detail-title">{{ selectedClassForDetail.name }}</h1>
            <p class="detail-sub">Tổng quan kết quả học tập</p>
          </div>
        </div>
      </div>

      <!-- KPI Cards -->
      <v-row dense class="mb-5">
        <v-col cols="6" sm="3">
          <div class="kpi-card">
            <i class="fa-solid fa-users kpi-icon"></i>
            <div class="kpi-value">{{ selectedClassForDetail.total_students }}</div>
            <div class="kpi-label">Tổng học sinh</div>
          </div>
        </v-col>
        <v-col cols="6" sm="3">
          <div class="kpi-card">
            <i class="fa-solid fa-chart-line kpi-icon"></i>
            <div class="kpi-value">
              {{ selectedClassForDetail.average_score > 0 ? selectedClassForDetail.average_score.toFixed(1) : '—' }}
            </div>
            <div class="kpi-label">Điểm trung bình</div>
          </div>
        </v-col>
        <v-col cols="6" sm="3">
          <div class="kpi-card">
            <i class="fa-solid fa-trophy kpi-icon" style="color:#f59e0b"></i>
            <div class="kpi-value">{{ topStudents.length }}</div>
            <div class="kpi-label">Học sinh xuất sắc</div>
          </div>
        </v-col>
        <v-col cols="6" sm="3">
          <div class="kpi-card">
            <i class="fa-solid fa-triangle-exclamation kpi-icon" style="color:#ef4444"></i>
            <div class="kpi-value">{{ lowPerformingStudents.length }}</div>
            <div class="kpi-label">Cần cải thiện</div>
          </div>
        </v-col>
      </v-row>

      <!-- Charts Row -->
      <v-row class="mb-5" v-if="!loadingStudents && students.length > 0">

        <!-- Pie Chart -->
        <v-col cols="12" md="5">
          <div class="chart-card">
            <div class="chart-card__header">
              <i class="fa-solid fa-chart-pie mr-2"></i>
              Phân loại học lực
            </div>
            <!-- Legend -->
            <div class="rank-legend px-4 pt-3 pb-1">
              <div class="rank-legend-item" v-for="item in rankLegend" :key="item.label">
                <span class="legend-dot" :style="{ background: item.color }"></span>
                <span class="legend-text">{{ item.label }} ({{ item.range }})</span>
              </div>
            </div>
            <div ref="pieChartRef" style="min-height:240px"></div>
          </div>
        </v-col>

        <!-- Top 10 by unit score: list -->
        <v-col cols="12" md="7">
          <div class="chart-card">
            <div class="chart-card__header">
              <i class="fa-solid fa-ranking-star mr-2"></i>
              Top 10 học sinh điểm bài học cao nhất
            </div>
            <div class="top10-list">
              <div
                v-for="(student, index) in top10ByUnitScore"
                :key="student.id"
                class="top10-row"
              >
                <div class="top10-rank" :class="index < 3 ? `top10-rank--${index+1}` : ''">{{ index + 1 }}</div>
                <div class="top10-avatar">{{ getInitials(student.name) }}</div>
                <div class="top10-info">
                  <div class="top10-name">{{ student.name }}</div>
                  <div class="top10-sub">Bài học: <b>{{ student.average_unit_score > 0 ? (student.average_unit_score) : '—' }}</b> &nbsp;|&nbsp; Kiểm tra: <b>{{ student.average_test_score > 0 ? (student.average_test_score) : '—' }}</b></div>
                </div>
                <div class="top10-score" :class="getScoreBadgeClass100(student.average_unit_score)">
                  {{ student.average_unit_score > 0 ? (student.average_unit_score) : '—' }}
                </div>
              </div>
              <div v-if="top10ByUnitScore.length === 0" class="empty-state py-6">
                <i class="fa-solid fa-user-slash"></i>
                <p>Chưa có dữ liệu</p>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Top Students List -->
      <div class="section-card mb-5" v-if="topStudents.length > 0">
        <div class="section-header">
          <i class="fa-solid fa-trophy mr-2" style="color:#f59e0b"></i>
          Học sinh xuất sắc
        </div>
        <div class="top-students-list">
          <div
            v-for="(student, index) in topStudents"
            :key="student.id"
            class="top-student-row"
          >
            <div class="top-rank">{{ index + 1 }}</div>
            <div class="top-avatar">{{ getInitials(student.name) }}</div>
            <div class="top-info">
              <div class="top-name">{{ student.name }}</div>
              <div class="top-scores">
                <span class="score-chip">TB kiểm tra: {{ student.average_test_score > 0 ? (student.average_test_score) : '—' }}</span>
                <span class="score-chip">TB bài học: {{ student.average_unit_score > 0 ? (student.average_unit_score).toFixed(2) : '—' }}</span>
              </div>
            </div>
            <div class="top-avg" :class="getScoreBadgeClass100(calculateTotalAverage(student))">
              {{ (calculateTotalAverage(student)).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>

      <!-- ==================== Full Student Table ==================== -->
      <div class="section-card">
        <div class="section-header d-flex align-center justify-space-between">
          <div>
            <i class="fa-solid fa-list-ul mr-2"></i>
            Danh sách học sinh
          </div>
          <span class="text-caption text-medium-emphasis">
            {{ processedStudents.length }}/{{ students.length }} học sinh
          </span>
        </div>

        <!-- ---- Toolbar: search + sort + filter ---- -->
        <div class="student-toolbar" v-if="!loadingStudents && students.length > 0">

          <!-- Search -->
          <div class="st-search-wrap">
            <i class="fa-solid fa-magnifying-glass st-search-icon"></i>
            <input
              v-model="studentSearch"
              type="text"
              class="st-search-input"
              placeholder="Tìm theo tên học sinh..."
            />
            <button v-if="studentSearch" class="st-search-clear" @click="studentSearch = ''">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Sort buttons -->
          <div class="st-sort-group">
            <span class="st-group-label">Sắp xếp:</span>
            <button
              class="st-sort-btn"
              :class="{ active: sortKey === 'average_test_score' }"
              @click="toggleSort('average_test_score')"
              title="Sắp xếp theo điểm TB kiểm tra"
            >
              <i class="fa-solid fa-file-pen mr-1"></i>
              TB Kiểm tra
              <i class="fa-solid sort-arrow" :class="getSortIcon('average_test_score')"></i>
            </button>
            <button
              class="st-sort-btn"
              :class="{ active: sortKey === 'average_unit_score' }"
              @click="toggleSort('average_unit_score')"
              title="Sắp xếp theo điểm TB bài học"
            >
              <i class="fa-solid fa-book-open mr-1"></i>
              TB Bài học
              <i class="fa-solid sort-arrow" :class="getSortIcon('average_unit_score')"></i>
            </button>
            <button
              class="st-sort-btn"
              :class="{ active: sortKey === 'total' }"
              @click="toggleSort('total')"
              title="Sắp xếp theo tổng trung bình"
            >
              <i class="fa-solid fa-star mr-1"></i>
              Tổng TB
              <i class="fa-solid sort-arrow" :class="getSortIcon('total')"></i>
            </button>
          </div>

          <!-- Rank filter chips -->
          <div class="st-filter-group">
            <span class="st-group-label">Lọc:</span>
            <button
              class="st-filter-chip"
              :class="{ active: filterRank === null }"
              @click="filterRank = null"
            >Tất cả</button>
            <button
              v-for="rank in rankFilters"
              :key="rank.key"
              class="st-filter-chip"
              :class="[{ active: filterRank === rank.key }, `chip-${rank.key}`]"
              @click="filterRank = filterRank === rank.key ? null : rank.key"
            >
              {{ rank.label }}
            </button>
          </div>
        </div>
        <!-- /Toolbar -->

        <div v-if="loadingStudents" class="text-center py-12">
          <v-progress-circular indeterminate color="primary" size="36" />
          <div class="mt-3 text-body-2 text-medium-emphasis">Đang tải...</div>
        </div>

        <div v-else-if="students.length === 0" class="empty-state py-10">
          <i class="fa-solid fa-user-slash"></i>
          <p>Lớp này chưa có học sinh</p>
        </div>

        <div v-else-if="processedStudents.length === 0" class="empty-state py-10">
          <i class="fa-solid fa-filter-circle-xmark"></i>
          <p>Không tìm thấy học sinh phù hợp</p>
          <button class="btn-reset-filter" @click="resetStudentFilters">
            <i class="fa-solid fa-rotate-left mr-1"></i>Xoá bộ lọc
          </button>
        </div>

        <v-table v-else density="comfortable" class="student-table" hover>
          <thead>
            <tr>
              <th class="th">#</th>
              <th class="th">Họ và tên</th>
              <th class="th sortable-th" @click="toggleSort('average_test_score')">
                <i class="fa-solid fa-file-pen mr-1"></i>Điểm TB kiểm tra
                <i class="fa-solid sort-icon-inline" :class="getSortIcon('average_test_score')"></i>
              </th>
              <th class="th sortable-th" @click="toggleSort('average_unit_score')">
                <i class="fa-solid fa-book-open mr-1"></i>Điểm TB bài học
                <i class="fa-solid sort-icon-inline" :class="getSortIcon('average_unit_score')"></i>
              </th>
              <th class="th sortable-th" @click="toggleSort('total')">
                Tổng TB
                <i class="fa-solid sort-icon-inline" :class="getSortIcon('total')"></i>
              </th>
              <th class="th">Xếp loại</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(student, index) in processedStudents"
              :key="student.id"
              class="tr-hover"
              @click="selectStudent(student)"
            >
              <td class="td text-medium-emphasis text-caption">{{ index + 1 }}</td>
              <td class="td">
                <div class="d-flex align-center gap-2">
                  <div class="s-avatar">{{ getInitials(student.name) }}</div>
                  <span class="font-weight-medium" style="font-size:13px">{{ student.name }}</span>
                </div>
              </td>
              <td class="td">
                <span class="score-tag" :class="getScoreTagClass100(student.average_test_score)">
                  {{ student.average_test_score > 0 ? (student.average_test_score).toFixed(2) : '—' }}
                </span>
              </td>
              <td class="td">
                <span class="score-tag" :class="getScoreTagClass100(student.average_unit_score)">
                  {{ student.average_unit_score > 0 ? (student.average_unit_score).toFixed(2) : '—' }}
                </span>
              </td>
              <td class="td">
                <span class="score-tag score-tag--bold" :class="getScoreTagClass100(calculateTotalAverage(student))">
                  {{ calculateTotalAverage(student) > 0 ? (calculateTotalAverage(student)).toFixed(2) : '—' }}
                </span>
              </td>
              <td class="td">
                <span class="rank-tag" :class="getRankClass(calculateTotalAverage(student))">
                  {{ getRankLabel(calculateTotalAverage(student)) }}
                </span>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>

    <!-- Scroll FAB -->
    <transition name="fade-up">
      <button v-if="showScrollToTop" class="scroll-fab" @click="scrollToTop">
        <i class="fa-solid fa-chevron-up"></i>
      </button>
    </transition>

  </v-container>
  <DetailStudent
    v-if="showDetailPopup"
    :id="selectedStudentId"
    @close="showDetailPopup = false"
  />
</template>

<script setup>
import {
  listClassPointApi,
  listStudenByClassIdApi,
} from '@/apis/modules/class.api'
import { useToast } from '@/stores/toast.store'
import ApexCharts from 'apexcharts'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import DetailStudent from "./components/DetailStudent.vue"

const classes = ref([])
const students = ref([])
const selectedClass = ref(null)
const selectedClassForDetail = ref(null)
const loadingStudents = ref(false)
const currentView = ref('classList')
const searchQuery = ref('')

const selectedStudentId = ref(null)
const showDetailPopup = ref(false)

const toast = useToast()
const showScrollToTop = ref(false)

// ---- Student table controls ----
const studentSearch = ref('')
const sortKey = ref('total')       // 'average_test_score' | 'average_unit_score' | 'total'
const sortDir = ref('desc')        // 'asc' | 'desc'
const filterRank = ref(null)       // null | 'excellent' | 'good_plus' | 'good' | 'avg' | 'weak'

const rankFilters = [
  { key: 'excellent', label: 'Xuất sắc' },
  { key: 'good_plus', label: 'Giỏi' },
  { key: 'good',      label: 'Khá' },
  { key: 'avg',       label: 'Trung bình' },
  { key: 'weak',      label: 'Yếu' },
]

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
}

const getSortIcon = (key) => {
  if (sortKey.value !== key) return 'fa-sort'
  return sortDir.value === 'desc' ? 'fa-sort-down' : 'fa-sort-up'
}

const resetStudentFilters = () => {
  studentSearch.value = ''
  filterRank.value = null
}

// Processed (filtered + sorted) students
const processedStudents = computed(() => {
  let list = [...students.value]

  // 1. Search by name
  const q = studentSearch.value.trim().toLowerCase()
  if (q) {
    list = list.filter(s => s.name.toLowerCase().includes(q))
  }

  // 2. Filter by rank
  if (filterRank.value) {
    list = list.filter(s => {
      const cls = getRankClassKey(calculateTotalAverage(s))
      return cls === filterRank.value
    })
  }

  // 3. Sort
  list.sort((a, b) => {
    let va, vb
    if (sortKey.value === 'total') {
      va = calculateTotalAverage(a)
      vb = calculateTotalAverage(b)
    } else {
      va = a[sortKey.value] || 0
      vb = b[sortKey.value] || 0
    }
    return sortDir.value === 'desc' ? vb - va : va - vb
  })

  return list
})

// ---- Chart refs ----
const pieChartRef = ref(null)
let pieChartInstance = null

const CLASS_COLORS = ['#4f7cac', '#5a8a6a', '#8a6a9a', '#ac7c4f', '#4f8aac', '#ac4f6a', '#6aac4f', '#7c6aac']
const getClassColor = (id) => CLASS_COLORS[(typeof id === 'number' ? id : parseInt(id) || 0) % CLASS_COLORS.length]

// ---- Helpers ----
const calculateTotalAverage = (student) => {
  const t = student.average_test_score || 0
  const u = student.average_unit_score || 0
  if (t === 0 && u === 0) return 0
  return (t + u) / 2
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// ---- Computed ----
const totalStudents = computed(() => classes.value.reduce((s, c) => s + (c.total_students || 0), 0))

const filteredClasses = computed(() => {
  if (!searchQuery.value.trim()) return classes.value
  return classes.value.filter(c =>
    c.name.toLowerCase().includes(searchQuery.value.trim().toLowerCase())
  )
})

const topStudents = computed(() =>
  [...students.value]
    .sort((a, b) => calculateTotalAverage(b) - calculateTotalAverage(a))
    .slice(0, 4)
    .filter(s => calculateTotalAverage(s) * 10 >= 90)
)

const top10ByUnitScore = computed(() =>
  [...students.value]
    .filter(s => s.average_unit_score > 0)
    .sort((a, b) => b.average_unit_score - a.average_unit_score)
    .slice(0, 10)
)

const lowPerformingStudents = computed(() =>
  students.value.filter(s => calculateTotalAverage(s) < 5)
)

// ---- Rank / Score helpers ----
const getScoreBadgeClass100 = (score10) => {
  if (!score10 || score10 === 0) return 'badge-grey'
  const s = score10
  if (s >= 90) return 'badge-green'
  if (s >= 65) return 'badge-orange'
  return 'badge-red'
}

const getScoreTagClass100 = (score10) => {
  if (!score10 || score10 === 0) return 'tag-grey'
  const s = score10
  if (s >= 90) return 'tag-green'
  if (s >= 65) return 'tag-orange'
  return 'tag-red'
}

// Returns rank key string (matches rankFilters keys)
const getRankClassKey = (score) => {
  if (!score || score === 0) return null
  const s = score
  if (s >= 90) return 'excellent'
  if (s >= 80) return 'good_plus'
  if (s >= 65) return 'good'
  if (s >= 50) return 'avg'
  return 'weak'
}

const getRankLabel = (score) => {
  if (!score || score === 0) return 'Chưa có'
  const s = score
  if (s >= 90) return 'Xuất sắc'
  if (s >= 80) return 'Giỏi'
  if (s >= 65) return 'Khá'
  if (s >= 50) return 'Trung bình'
  return 'Yếu'
}

const getRankClass = (score) => {
  if (!score || score === 0) return 'rank-na'
  const s = score
  if (s >= 90) return 'rank-excellent'
  if (s >= 80) return 'rank-good-plus'
  if (s >= 65) return 'rank-good'
  if (s >= 50) return 'rank-avg'
  return 'rank-weak'
}

// ---- Chart config ----
const rankLegend = [
  { label: 'Xuất sắc',   range: '90–100', color: '#22c55e' },
  { label: 'Giỏi',       range: '80–89',  color: '#3b82f6' },
  { label: 'Khá',        range: '65–79',  color: '#f59e0b' },
  { label: 'Trung bình', range: '50–64',  color: '#f97316' },
  { label: 'Yếu',        range: '<50',    color: '#ef4444' },
]

const getRankIndex = (score10) => {
  const s = score10
  if (s >= 90) return 0
  if (s >= 80) return 1
  if (s >= 65) return 2
  if (s >= 50) return 3
  return 4
}

const buildPieData = () => {
  const counts = [0, 0, 0, 0, 0]
  students.value.forEach(s => {
    const avg = calculateTotalAverage(s)
    if (avg > 0) counts[getRankIndex(avg)]++
  })
  return counts
}

const renderPieChart = async () => {
  await nextTick()
  if (!pieChartRef.value) return
  const series = buildPieData()
  if (pieChartInstance) {
    pieChartInstance.updateOptions({ series, labels: rankLegend.map(r => `${r.label} (${r.range})`) })
    return
  }
  pieChartInstance = new ApexCharts(pieChartRef.value, {
    chart: { type: 'pie', height: 240, fontFamily: 'inherit', toolbar: { show: false } },
    series,
    labels: rankLegend.map(r => `${r.label} (${r.range})`),
    colors: rankLegend.map(r => r.color),
    legend: { show: false },
    dataLabels: {
      enabled: true,
      formatter: (val, opts) => {
        if (series[opts.seriesIndex] === 0) return ''
        return `${Math.round(val)}%`
      },
      style: { fontSize: '12px', fontWeight: 600, colors: ['#fff'] },
      dropShadow: { enabled: false }
    },
    stroke: { width: 2, colors: ['#fff'] },
    tooltip: {
      y: { formatter: (val, opts) => `${series[opts.seriesIndex]} học sinh (${Math.round(val)}%)` }
    },
    plotOptions: { pie: { expandOnClick: false } }
  })
  pieChartInstance.render()
}

const destroyCharts = () => {
  if (pieChartInstance) { pieChartInstance.destroy(); pieChartInstance = null }
}

watch(students, async (newVal) => {
  if (currentView.value === 'classDetail' && newVal.length > 0) {
    destroyCharts()
    await renderPieChart()
  }
})

watch(currentView, (val) => {
  if (val === 'classList') {
    destroyCharts()
    resetStudentFilters()
  }
})

// ---- API ----
const fetchClasses = async () => {
  try {
    const response = await listClassPointApi()
    classes.value = response.data.data.map(c => ({ ...c }))
  } catch {
    toast.show("Có lỗi xảy ra khi tải danh sách lớp", "error")
  }
}

const fetchStudentsByClassId = async (classId) => {
  loadingStudents.value = true
  students.value = []
  resetStudentFilters()
  try {
    const response = await listStudenByClassIdApi(classId)
    students.value = response.data.data.map(s => ({ ...s }))
  } catch {
    toast.error('Có lỗi xảy ra khi tải danh sách học sinh')
  } finally {
    loadingStudents.value = false
  }
}

const manageClass = async (classItem) => {
  selectedClassForDetail.value = classItem
  currentView.value = 'classDetail'
  await fetchStudentsByClassId(classItem.id)
}

const backToClassList = () => {
  currentView.value = 'classList'
  selectedClassForDetail.value = null
  students.value = []
}

const selectStudent = (student) => {
  selectedStudentId.value = student.id
  showDetailPopup.value = true
}

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
const handleScroll = () => {
  showScrollToTop.value = (window.pageYOffset || document.documentElement.scrollTop) > 300
}

onMounted(() => { fetchClasses(); window.addEventListener('scroll', handleScroll) })
onUnmounted(() => { destroyCharts(); window.removeEventListener('scroll', handleScroll) })
</script>

<style scoped>
* { box-sizing: border-box; }

/* ---- Header ---- */
.page-header {
  display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px;
}
.page-title { font-size: 20px; font-weight: 700; color: #1e293b; margin: 0; }
.page-subtitle { font-size: 13px; color: #64748b; margin: 3px 0 0; }
.header-stats { display: flex; gap: 10px; flex-shrink: 0; }
.stat-pill {
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 8px 16px; text-align: center; min-width: 70px;
}
.stat-num { display: block; font-size: 20px; font-weight: 700; color: #1e293b; line-height: 1; }
.stat-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; }

/* ---- Search Bar ---- */
.search-bar-wrap { position: relative; display: flex; align-items: center; max-width: 380px; }
.search-icon { position: absolute; left: 12px; color: #94a3b8; font-size: 13px; pointer-events: none; }
.search-input {
  width: 100%; padding: 9px 34px; border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 13px; color: #1e293b; background: #fff; outline: none; transition: border-color 0.2s;
}
.search-input:focus { border-color: #4f7cac; }
.search-input::placeholder { color: #b0b8c4; }
.search-clear {
  position: absolute; right: 10px; background: none; border: none;
  color: #94a3b8; cursor: pointer; font-size: 13px; padding: 2px; line-height: 1;
}
.search-clear:hover { color: #64748b; }

/* ---- Empty State ---- */
.empty-state { text-align: center; padding: 40px 0; color: #94a3b8; }
.empty-state i { font-size: 32px; display: block; margin-bottom: 10px; }
.empty-state p { font-size: 14px; margin: 0; }
.btn-reset-filter {
  margin-top: 12px; display: inline-flex; align-items: center; gap: 5px;
  background: #f1f5f9; border: 1px solid #e2e8f0; color: #475569;
  border-radius: 7px; padding: 6px 14px; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: 0.15s;
}
.btn-reset-filter:hover { background: #e2e8f0; }

/* ---- Class List ---- */
.class-list-wrap { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
.class-list-item {
  display: flex; align-items: center; gap: 16px;
  padding: 13px 16px;
  border-bottom: 1px solid #f1f5f9;
  border-left: 4px solid #e2e8f0;
  transition: background 0.15s;
}
.class-list-item:last-child { border-bottom: none; }
.class-list-item:hover { background: #f8fafc; }

.cli-main { display: flex; align-items: center; gap: 10px; min-width: 160px; flex-shrink: 0; }
.cli-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.cli-info { display: flex; flex-direction: column; }
.cli-name { font-size: 14px; font-weight: 700; color: #1e293b; }
.cli-meta { font-size: 12px; color: #94a3b8; margin-top: 1px; }

.cli-progress { flex: 1; min-width: 0; }
.cli-progress-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.cli-progress-text { font-size: 11px; color: #94a3b8; }
.cli-progress-val { font-size: 14px; font-weight: 700; }
.progress-bar-bg { height: 6px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
.progress-bar-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }

.btn-detail {
  flex-shrink: 0; padding: 6px 14px; border: 1.5px solid #4f7cac; background: #fff;
  color: #4f7cac; border-radius: 7px; font-size: 12px; font-weight: 600;
  cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 5px;
  white-space: nowrap;
}
.btn-detail:hover { background: #4f7cac; color: #fff; }

/* ---- Score display ---- */
.badge-green  { color: #16a34a; }
.badge-orange { color: #ca8a04; }
.badge-red    { color: #dc2626; }
.badge-grey   { color: #94a3b8; }

/* ---- Detail Header ---- */
.detail-header { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.btn-back {
  display: flex; align-items: center; gap: 6px;
  background: #f8fafc; border: 1.5px solid #e2e8f0; color: #475569;
  border-radius: 8px; padding: 7px 14px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.15s;
}
.btn-back:hover { background: #e8edf3; }
.detail-title-block { display: flex; align-items: center; gap: 10px; }
.detail-class-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.detail-title { font-size: 19px; font-weight: 700; color: #1e293b; margin: 0; }
.detail-sub { font-size: 12px; color: #64748b; margin: 2px 0 0; }

/* ---- KPI Cards ---- */
.kpi-card {
  background: #f8fafc; border: 1px solid #e8edf3; border-radius: 10px;
  padding: 14px 10px; text-align: center;
}
.kpi-icon { font-size: 18px; color: #4f7cac; display: block; margin-bottom: 8px; }
.kpi-value { font-size: 24px; font-weight: 800; color: #1e293b; line-height: 1; margin-bottom: 4px; }
.kpi-label { font-size: 12px; color: #64748b; }

/* ---- Chart Cards ---- */
.chart-card { background: #fff; border: 1px solid #e8edf3; border-radius: 10px; overflow: hidden; height: 100%; }
.chart-card__header {
  padding: 12px 16px; font-size: 13px; font-weight: 600; color: #1e293b;
  border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; background: #fafafa;
}

/* ---- Rank Legend ---- */
.rank-legend { display: flex; flex-wrap: wrap; gap: 6px 14px; }
.rank-legend-item { display: flex; align-items: center; gap: 5px; }
.legend-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.legend-text { font-size: 11px; color: #64748b; }

/* ---- Section Card ---- */
.section-card { background: #fff; border: 1px solid #e8edf3; border-radius: 10px; overflow: hidden; }
.section-header {
  padding: 12px 16px; font-size: 13px; font-weight: 600; color: #1e293b;
  background: #fafafa; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center;
}
.section-badge {
  margin-left: 8px; font-size: 11px; background: #fef9c3; color: #92400e;
  border-radius: 5px; padding: 1px 7px; font-weight: 500;
}

/* ==================== STUDENT TOOLBAR ==================== */
.student-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #fcfcfd;
}

/* Search inside table */
.st-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1 1 200px;
  max-width: 280px;
  min-width: 160px;
}
.st-search-icon {
  position: absolute; left: 10px; color: #94a3b8; font-size: 12px; pointer-events: none;
}
.st-search-input {
  width: 100%; padding: 7px 28px 7px 28px;
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 12.5px; color: #1e293b; background: #fff; outline: none;
  transition: border-color 0.2s;
}
.st-search-input:focus { border-color: #4f7cac; }
.st-search-input::placeholder { color: #b0b8c4; }
.st-search-clear {
  position: absolute; right: 8px; background: none; border: none;
  color: #94a3b8; cursor: pointer; font-size: 11px; padding: 2px; line-height: 1;
}
.st-search-clear:hover { color: #475569; }

/* Sort group */
.st-sort-group {
  display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
}
.st-group-label {
  font-size: 11px; color: #94a3b8; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; margin-right: 2px;
}
.st-sort-btn {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 5px 11px; border: 1.5px solid #e2e8f0; border-radius: 7px;
  background: #fff; color: #475569; font-size: 11.5px; font-weight: 600;
  cursor: pointer; transition: 0.15s; white-space: nowrap;
}
.st-sort-btn:hover { border-color: #4f7cac; color: #4f7cac; background: #f0f6ff; }
.st-sort-btn.active { border-color: #4f7cac; background: #4f7cac; color: #fff; }
.st-sort-btn.active:hover { background: #3d6490; }
.sort-arrow { font-size: 10px; transition: 0.15s; }

/* Filter chips */
.st-filter-group {
  display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
}
.st-filter-chip {
  padding: 4px 10px; border: 1.5px solid #e2e8f0; border-radius: 20px;
  background: #fff; color: #475569; font-size: 11px; font-weight: 600;
  cursor: pointer; transition: 0.15s; white-space: nowrap;
}
.st-filter-chip:hover { border-color: #94a3b8; }
.st-filter-chip.active { border-color: transparent; color: #fff; }

/* Rank-specific chip colors when active */
.st-filter-chip.chip-excellent.active { background: #16a34a; }
.st-filter-chip.chip-good_plus.active { background: #1d4ed8; }
.st-filter-chip.chip-good.active      { background: #ca8a04; }
.st-filter-chip.chip-avg.active       { background: #c2410c; }
.st-filter-chip.chip-weak.active      { background: #dc2626; }

/* Chip hover ring matching rank colors */
.st-filter-chip.chip-excellent:hover { border-color: #16a34a; color: #16a34a; }
.st-filter-chip.chip-good_plus:hover { border-color: #1d4ed8; color: #1d4ed8; }
.st-filter-chip.chip-good:hover      { border-color: #ca8a04; color: #ca8a04; }
.st-filter-chip.chip-avg:hover       { border-color: #c2410c; color: #c2410c; }
.st-filter-chip.chip-weak:hover      { border-color: #dc2626; color: #dc2626; }

/* Sortable table headers */
.sortable-th { cursor: pointer; user-select: none; }
.sortable-th:hover { color: #4f7cac !important; }
.sort-icon-inline { font-size: 10px; margin-left: 3px; color: #94a3b8; }

/* ---- Top Students ---- */
.top-students-list { padding: 10px 12px; display: flex; flex-direction: column; gap: 7px; }
.top-student-row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 8px; background: #f9fafb; border: 1px solid #f1f5f9;
}
.top-rank {
  width: 22px; height: 22px; border-radius: 6px; background: #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #475569; flex-shrink: 0;
}
.top-avatar {
  width: 32px; height: 32px; border-radius: 8px; background: #e0e7ff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #4f46e5; flex-shrink: 0;
}
.top-info { flex: 1; min-width: 0; }
.top-name { font-size: 13px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.top-scores { display: flex; gap: 6px; margin-top: 2px; }
.score-chip { font-size: 11px; background: #f1f5f9; color: #475569; border-radius: 5px; padding: 1px 7px; }
.top-avg { font-size: 17px; font-weight: 800; flex-shrink: 0; }

/* ---- Student Table ---- */
.student-table { width: 100%; }
.th {
  padding: 10px 14px !important; font-size: 11px !important; font-weight: 700 !important;
  text-transform: uppercase; letter-spacing: 0.04em; color: #64748b !important;
  border-bottom: 2px solid #e2e8f0 !important; background: #fafafa;
}
.td { padding: 10px 14px !important; border-bottom: 1px solid #f1f5f9 !important; font-size: 13px; }
.tr-hover { cursor: pointer; transition: background 0.12s; }
.tr-hover:hover { background: #f8fafc !important; }
.s-avatar {
  width: 28px; height: 28px; border-radius: 7px; background: #dbeafe;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #1d4ed8; flex-shrink: 0;
}

.score-tag { display: inline-block; padding: 2px 9px; border-radius: 6px; font-weight: 600; font-size: 12px; }
.score-tag--bold { font-size: 13px; }
.tag-green  { background: #dcfce7; color: #16a34a; }
.tag-orange { background: #fef9c3; color: #ca8a04; }
.tag-red    { background: #fee2e2; color: #dc2626; }
.tag-grey   { background: #f1f5f9; color: #94a3b8; }

.rank-tag { display: inline-block; font-size: 11px; padding: 2px 9px; border-radius: 5px; font-weight: 600; }
.rank-excellent { background: #dcfce7; color: #15803d; }
.rank-good-plus { background: #dbeafe; color: #1d4ed8; }
.rank-good      { background: #fef9c3; color: #92400e; }
.rank-avg       { background: #ffedd5; color: #c2410c; }
.rank-weak      { background: #fee2e2; color: #dc2626; }
.rank-na        { background: #f1f5f9; color: #94a3b8; }

/* ---- Top 10 List ---- */
.top10-list { padding: 8px 12px; display: flex; flex-direction: column; gap: 6px; max-height: 420px; overflow-y: auto; }
.top10-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 8px; background: #f9fafb;
  border: 1px solid #f1f5f9; transition: background 0.12s;
}
.top10-row:hover { background: #f1f5f9; }
.top10-rank {
  width: 24px; height: 24px; border-radius: 6px; background: #e2e8f0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #64748b; flex-shrink: 0;
}
.top10-rank--1 { background: #fef9c3; color: #b45309; }
.top10-rank--2 { background: #f1f5f9; color: #475569; }
.top10-rank--3 { background: #fff7ed; color: #c2410c; }
.top10-avatar {
  width: 30px; height: 30px; border-radius: 7px; background: #dbeafe;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #1d4ed8; flex-shrink: 0;
}
.top10-info { flex: 1; min-width: 0; }
.top10-name { font-size: 13px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.top10-sub { font-size: 11px; color: #94a3b8; margin-top: 1px; }
.top10-score { font-size: 16px; font-weight: 800; flex-shrink: 0; }

/* ---- Scroll FAB ---- */
.scroll-fab {
  position: fixed; bottom: 24px; right: 24px;
  width: 40px; height: 40px; border-radius: 50%;
  background: #4f7cac; color: #fff; border: none;
  font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 10px rgba(79,124,172,0.35); z-index: 100; transition: 0.2s;
}
.scroll-fab:hover { background: #3d6490; transform: translateY(-2px); }

.fade-up-enter-active, .fade-up-leave-active { transition: all 0.25s ease; }
.fade-up-enter-from, .fade-up-leave-to { opacity: 0; transform: translateY(10px); }
</style>
