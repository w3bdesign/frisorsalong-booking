<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { Booking } from '@/types/booking'

const bookings = ref<Booking[]>([])
const loading = ref(true)
const totalBookings = ref(0)
const todayBookings = ref(0)
const upcomingBookings = ref(0)

const fetchBookings = async () => {
  try {
    // TODO: Replace with actual API call
    const response = await fetch('http://localhost:3000/api/bookings')
    const data = await response.json()
    bookings.value = data
    calculateMetrics()
  } catch (error) {
    ElMessage.error('Failed to fetch bookings')
  } finally {
    loading.value = false
  }
}

const calculateMetrics = () => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  totalBookings.value = bookings.value.length
  todayBookings.value = bookings.value.filter(booking => 
    new Date(booking.startTime).toDateString() === today.toDateString()
  ).length
  upcomingBookings.value = bookings.value.filter(booking =>
    new Date(booking.startTime) > today
  ).length
}

onMounted(() => {
  fetchBookings()
})
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="20" class="mb-4">
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>Total Bookings</h3>
            </div>
          </template>
          <div class="card-content">
            <span class="metric">{{ totalBookings }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>Today's Bookings</h3>
            </div>
          </template>
          <div class="card-content">
            <span class="metric">{{ todayBookings }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <h3>Upcoming Bookings</h3>
            </div>
          </template>
          <div class="card-content">
            <span class="metric">{{ upcomingBookings }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="booking-list">
      <template #header>
        <div class="card-header">
          <h2>Recent Bookings</h2>
          <el-button type="primary" @click="fetchBookings">Refresh</el-button>
        </div>
      </template>
      
      <el-table
        v-loading="loading"
        :data="bookings"
        style="width: 100%"
        :default-sort="{ prop: 'startTime', order: 'descending' }"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="customerName" label="Customer" />
        <el-table-column prop="employeeName" label="Employee" />
        <el-table-column prop="serviceName" label="Service" />
        <el-table-column prop="startTime" label="Date & Time" sortable>
          <template #default="scope">
            {{ new Date(scope.row.startTime).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === 'CONFIRMED' ? 'success' : 
                     scope.row.status === 'PENDING' ? 'warning' : 'info'"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="150">
          <template #default="scope">
            <el-button-group>
              <el-button
                size="small"
                type="primary"
                @click="viewBooking(scope.row.id)"
              >
                View
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="cancelBooking(scope.row.id)"
              >
                Cancel
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2, .card-header h3 {
  margin: 0;
}

.card-content {
  text-align: center;
}

.metric {
  font-size: 2.5em;
  font-weight: bold;
  color: #409EFF;
}

.booking-list {
  margin-top: 20px;
}

.mb-4 {
  margin-bottom: 1rem;
}
</style>
