<template>
    <tr
        ref="tableRow"
        :class="{
            'cursor-pointer transition-all duration-300 hover:bg-secondary-50 focus:outline-none active:outline-none':
                clickableRow && !isDragging,
            'bg-secondary-50':
                row[selectedRowIdType ?? 'id'] === selectedRowId && !isDragging,
        }"
        class="!outline-none"
        @dblclick="emit('onRowDoubleClick', row)"
        @keydown.enter="emit('onRowDoubleClick', row)"
    >
        <td v-if="checkableRow" class="pl-4">
            <BaseCheckbox
                :model-value="checkedDataControl(row)"
                @update:model-value="
                    (checked) => emit('onCheckRow', row, checked)
                "
            />
        </td>
        <td
            v-for="(column, j) in columns.filter(
                (columnQuery) => columnQuery.show
            )"
            :key="`column-item-${j}`"
            class="p-2"
            @click="emit('onRowClick', row)"
        >
            <div
                :style="{
                    width: column.width || 'unset',
                }"
                class="w-auto pr-3 truncate overflow-hidden whitespace-nowrap text-ellipsis"
            >
                <slot
                    v-if="slots[`item-${column.label}`]"
                    :name="`item-${column.label}`"
                    v-bind="{
                        [column.label]: row[column.label],
                        row,
                    }"
                />
                <slot
                    v-else-if="
                        slots[`item-${column.label}-${column.reduce}`] &&
                        column.relation == 'single' &&
                        column.reduce &&
                        row[column.label]
                    "
                    :name="`item-${column.label}-${column.reduce}`"
                    v-bind="{
                        [column.reduce]: row[column.label][column.reduce],
                        row,
                    }"
                />
                <div v-else-if="column.relation == 'multiple' && column.reduce">
                    <div class="flex items-center gap-2">
                        <BaseBadge
                            v-for="(relation, k) in row[column.label]"
                            :key="`relation-multiple-${k}`"
                            :text="
                                column.translationElement
                                    ? t(
                                          column.translationElement +
                                              relation[column.reduce]
                                      )
                                    : relation[column.reduce]
                            "
                            color="primary"
                            size="sm"
                            variant="outline"
                        />
                    </div>
                </div>
                <div v-else-if="column.relation == 'single' && column.reduce">
                    <BaseBadge
                        v-if="
                            row[column.label] &&
                            row[column.label][column.reduce]
                        "
                        :text="
                            column.translationElement
                                ? t(
                                      column.translationElement +
                                          row[column.label][column.reduce]
                                  )
                                : row[column.label][column.reduce]
                        "
                        color="primary"
                        size="md"
                        variant="outline"
                    />
                </div>
                <div
                    v-else-if="
                        typeof row[column.label] === 'boolean' ||
                        column.isBoolean
                    "
                >
                    <BaseButtonIcon
                        :color="row[column.label] ? 'success' : 'error'"
                        :icon="row[column.label] ? 'check-big' : 'clear'"
                        size="xs"
                        variant="outline"
                    />
                </div>
                <BaseText
                    v-else
                    :text="
                        column.translationElement
                            ? t(column.translationElement + row[column.label])
                            : row[column.label]
                    "
                    :tone="700"
                    color="neutral"
                    truncate
                    type="p-md"
                />
            </div>
        </td>
        <td v-if="hasActions">
            <slot :row="row" name="actions" />
        </td>
    </tr>
</template>

<script lang="ts" setup>
import { t } from '@/services/i18n'
import BaseBadge from '@/components/base/badge/BaseBadge.vue'
import BaseButtonIcon from '@/components/base/button/BaseButtonIcon.vue'
import BaseText from '@/components/base/text/BaseText.vue'
import Column from '@/types/column'
import { ref, useSlots, watch } from 'vue'
import BaseCheckbox from '@/components/base/input/BaseCheckbox.vue'

const props = defineProps<{
    columns: Column[]
    row: any
    clickableRow?: boolean
    checkableRow?: boolean
    selectedRowId?: string | number
    selectedRowIdType?: string
    hasActions?: boolean
    checkedData?: any[]
    isDragging?: boolean
}>()

const emit = defineEmits(['onRowClick', 'onCheckRow', 'onRowDoubleClick'])

const slots = useSlots()
const tableRow = ref()

watch(
    () => props.selectedRowId,
    () => {
        if (
            props.row[props.selectedRowIdType ?? 'id'] ===
                props.selectedRowId &&
            !props.isDragging
        ) {
            tableRow.value?.focus()
        }
    },
    { immediate: true }
)

const checkedDataControl = (row: any) => {
    let includes = false
    if (props.checkedData) {
        props.checkedData.forEach((element) => {
            if (JSON.stringify(row) === JSON.stringify(element)) {
                includes = true
            }
        })
    }

    return includes
}
</script>
