<template>
    <div class="flex flex-col items-center justify-center overflow-auto">
        <div class="flex px-3 py-3 justify-between w-full items-center">
            <div>
                <BasePaginationElement
                    :active="links[0]?.active"
                    :disabled="!links[0]?.url"
                    left-icon="chevron-left"
                    :text="t('global.previous')"
                    @on-click="$emit('onSetPage', getActivePage() - 1)"
                />
            </div>
            <div class="overflow-auto mx-2">
                <div class="hidden md:flex w-full gap-2">
                    <div
                        v-for="(page, i) in links"
                        :key="`pagination-element-${page.label}`"
                    >
                        <BasePaginationElement
                            v-if="i !== 0 && i !== links.length - 1"
                            :active="page.active"
                            :disabled="!page.url"
                            :left-icon="i == 0 ? 'chevron-left' : undefined"
                            :right-icon="
                                i == links.length - 1
                                    ? 'chevron-right'
                                    : undefined
                            "
                            :text="
                                i == 0
                                    ? t('global.previous')
                                    : i == links.length - 1
                                      ? t('global.next')
                                      : page.label
                            "
                            @on-click="
                                $emit(
                                    'onSetPage',
                                    i == 0
                                        ? getActivePage() - 1
                                        : i == links.length - 1
                                          ? getActivePage() + 1
                                          : parseInt(page.label)
                                )
                            "
                        />
                    </div>
                </div>
            </div>
            <div>
                <BasePaginationElement
                    :active="links[links.length - 1]?.active"
                    :disabled="!links[links.length - 1]?.url"
                    right-icon="chevron-right"
                    :text="t('global.next')"
                    @on-click="$emit('onSetPage', getActivePage() + 1)"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import Pagination from '@/types/pagination'
import BasePaginationElement from './BasePaginationElement.vue'
import { t } from '@/services/i18n'

defineEmits(['onSetPage'])

const props = defineProps<{
    links: Pagination['links']
}>()

function getActivePage() {
    let page = '0'
    props.links.forEach((element) => {
        if (element.active) {
            page = element.label
        }
    })
    return parseInt(page)
}
</script>
