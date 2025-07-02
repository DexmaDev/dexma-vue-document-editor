<template>
    <PieChart
        :chart-data="{ labels, datasets: computedDatasets }"
        :options="options"
    />
</template>

<script setup lang="ts">
import { generateColorVariant } from '@/services/utils'
import { Dataset } from '@/types/chart'
import { ArcElement, Chart, PieController, Tooltip } from 'chart.js'
import { computed } from 'vue'
import { PieChart } from 'vue-chart-3'

Chart.register(PieController, ArcElement, Tooltip)

const props = defineProps<{
    labels: string[]
    datasets: Dataset[]
    backgroundColor?: string
    options?: Record<string, any>
}>()

const computedDatasets = computed(() => {
    return props.datasets.map((dataset) => {
        return {
            ...dataset,
            backgroundColor: props.backgroundColor
                ? props.labels.map(() =>
                      generateColorVariant(props.backgroundColor!)
                  )
                : undefined,
        }
    })
})
</script>
