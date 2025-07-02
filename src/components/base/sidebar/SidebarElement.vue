<template>
    <div v-if="can(element.permission)">
        <div v-if="!element.isDropDown">
            <div
                v-if="element.separator && !isCollapsed"
                class="flex w-full px-4"
            >
                <BaseText
                    :text="element.label"
                    :tone="500"
                    color="neutral"
                    font="semibold"
                    type="p-sm"
                />
            </div>
            <div
                v-else-if="!element.separator && element.icon"
                :class="{
                    'bg-neutral-100':
                        router.currentRoute.value.meta.activeRoute ===
                        element.activeRoute,
                }"
                class="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-all duration-300 hover:bg-neutral-100"
                @click="onElementClick(element)"
            >
                <div class="flex items-center gap-2">
                    <BaseIcon :name="element.icon" size="sm" />
                    <BaseText
                        v-if="!isCollapsed"
                        :text="element.label"
                        :tone="700"
                        color="neutral"
                        font="semibold"
                        type="p-sm"
                    />
                </div>
            </div>
        </div>
        <div v-else-if="element.isDropDown">
            <BaseCollapseMenu :is-collapsed="isCollapsed">
                <template #title>
                    <BaseText
                        v-if="element.separator && !isCollapsed"
                        :text="element.label"
                        :tone="500"
                        color="neutral"
                        font="semibold"
                        type="p-sm"
                    />
                    <div
                        v-else-if="!element.separator && element.icon"
                        class="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2"
                    >
                        <div class="flex items-center gap-2">
                            <BaseIcon
                                v-if="element.icon"
                                :name="element.icon"
                                size="sm"
                            />
                            <BaseText
                                v-if="!isCollapsed"
                                :text="element.label"
                                :tone="700"
                                color="neutral"
                                font="semibold"
                                type="p-sm"
                            />
                        </div>
                    </div>
                </template>

                <template #content>
                    <div
                        v-for="child in filteredChildren(element)"
                        :key="child.label"
                        :class="{
                            'bg-neutral-200':
                                router.currentRoute.value.meta.activeRoute ===
                                child.activeRoute,
                        }"
                        class="flex fill-avaiable cursor-pointer gap-2 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-neutral-200"
                        @click="onElementClick(child)"
                    >
                        <BaseIcon
                            v-if="child.icon"
                            :name="child.icon"
                            size="sm"
                        />
                        <BaseText
                            v-if="!isCollapsed"
                            :text="child.label"
                            :tone="700"
                            color="neutral"
                            font="semibold"
                            type="p-sm"
                        />
                    </div>
                </template>
            </BaseCollapseMenu>
        </div>
    </div>
</template>

<script lang="ts" setup>
import SidebarElement from '@/types/sidebarElement'
import BaseIcon from '../icon/BaseIcon.vue'
import BaseText from '../text/BaseText.vue'
import router from '@/router'
import { can } from '@/services/ability'
import BaseCollapseMenu from '@/components/base/collapse/BaseCollapseMenu.vue'

defineProps<{
    element: SidebarElement
    isCollapsed: boolean
}>()

const onElementClick = (element: SidebarElement) => {
    if (element.routeName) {
        router.push({
            name: element.routeName,
        })
    }
}

const filteredChildren = (element: SidebarElement): SidebarElement[] => {
    if (element.children) {
        return element.children.filter((child: SidebarElement) =>
            can(child.permission)
        )
    }
    return []
}
</script>
<style scoped>
.fill-avaiable {
    width: -moz-available;
    width: -webkit-fill-available;
    width: fill-available;
}
</style>
