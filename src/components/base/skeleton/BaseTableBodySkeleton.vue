<template>
    <tbody class="divide-y divide-neutral-200">
        <tr v-for="(skeleton, i) in rows" :key="i">
            <td v-for="(skeletonChild, j) in colums" :key="j" class="p-2">
                <div class="h-5 w-20 rounded-full bg-neutral-200" />
            </td>
        </tr>
    </tbody>
</template>
<script setup lang="ts">
withDefaults(
    defineProps<{
        rows?: number
        colums?: number
        pulse?: boolean
    }>(),
    {
        rows: 4,
        colums: 4,
        pulse: false,
    }
)
</script>
