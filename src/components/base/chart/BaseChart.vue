<template>
    <template v-if="type === 'pie'">
        <BasePieChart
            :labels="labels"
            :datasets="datasets"
            :background-color="backgroundColor"
            :options="options"
        />
    </template>
</template>

<script setup lang="ts">
import { Chart, ChartType, Legend } from 'chart.js'
import BasePieChart from './BasePieChart.vue'
import { Dataset } from '@/types/chart'

const props = withDefaults(
    defineProps<{
        type: ChartType
        labels: string[]
        datasets: Dataset[]
        backgroundColor?: string
        hasLegend?: boolean
        options?: any
    }>(),
    {
        type: 'pie',
        labels: () => [],
        datasets: () => [],
        backgroundColor: undefined,
        hasLegend: true,
        options: undefined,
    }
)

if (props.hasLegend) {
    Chart.register(Legend)
}
</script>

<style scoped></style>
