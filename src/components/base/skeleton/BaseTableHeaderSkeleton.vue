<template>
    <thead class="bg-neutral-100">
        <tr>
            <th
                v-for="(skeleton, i) in colums"
                :key="i"
                class="p-2 first:rounded-tl-xl last:rounded-tr-xl"
            >
                <div class="flex w-full items-center gap-1">
                    <div class="h-5 w-20 rounded-full bg-neutral-200" />
                </div>
            </th>
        </tr>
    </thead>
</template>
<script setup lang="ts">
withDefaults(
    defineProps<{
        colums?: number
        pulse?: boolean
    }>(),
    {
        colums: 4,
        pulse: false,
    }
)
</script>
