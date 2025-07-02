<template>
    <aside
        :class="{
            'w-72 min-w-max': !isCollapsed,
            'w-16': isCollapsed,
        }"
        class="flex h-full flex-col gap-6 border-r border-neutral-200 px-2 py-6"
    >
        <div
            :class="{
                'flex-row': !isCollapsed,
                'flex-col-reverse': isCollapsed,
            }"
            class="flex w-full items-center justify-between gap-4"
        >
            <div class="cursor-pointer" @click="onIndex">
                <div v-if="!isCollapsed">
                    <div class="flex items-center gap-2">
                        <img
                            alt="logo"
                            class="h-8"
                            src="@public/images/logo_small.svg"
                        />
                    </div>
                </div>
                <img v-else alt="logo" src="@public/images/logo_small.svg" />
            </div>
            <div v-if="innerWidth > 640">
                <BaseButtonIcon
                    :icon="!isCollapsed ? 'skip-to-previous' : 'skip-to-next'"
                    color="neutral"
                    size="sm"
                    variant="outline"
                    @click="toggleCollapsed"
                />
            </div>
        </div>
        <div class="flex w-full grow flex-col gap-2 overflow-auto">
            <SidebarElement
                v-for="(element, i) in sidebarElements"
                :key="`sidebar-element-${i}`"
                :element="element"
                :is-collapsed="isCollapsed"
            />
        </div>
        <div
            :class="{
                'justify-between px-3': !isCollapsed,
                'px-auto justify-center': isCollapsed,
            }"
            class="flex h-11 w-full justify-between rounded-lg border border-neutral-100 py-1.5"
        >
            <div
                :class="{ 'justify-center': isCollapsed }"
                class="flex w-full items-center gap-3"
            >
                <BaseAvatar :image="authStore.user.userImage?.url" size="sm" />
                <BaseText
                    v-if="!isCollapsed"
                    :text="authStore.user.fullName!"
                    :tone="700"
                    color="neutral"
                    font="medium"
                    type="p-md"
                />
            </div>
            <BaseButtonIcon
                v-if="!isCollapsed"
                color="neutral"
                icon="help-question"
                size="sm"
                variant="blank"
                :tooltip="t('pages.sidebar.changelog')"
                @click="onOpenChangelogModal"
            />
            <BaseButtonIcon
                v-if="!isCollapsed"
                color="neutral"
                icon="logout"
                size="sm"
                variant="blank"
                @click="onLogout"
            />
        </div>
    </aside>

    <ChangelogModal
        v-if="openChangelogModal"
        @on-close="onCloseChangelogModal"
    />
</template>

<script lang="ts" setup>
import sidebarElement from '@/types/sidebarElement'
import BaseButtonIcon from '../button/BaseButtonIcon.vue'
import { computed, ref } from 'vue'
import SidebarElement from './SidebarElement.vue'
import { t } from '@/services/i18n'
import { AuthRoutesNames, RouterNames } from '@/enums/RouterNames'
import BaseText from '../text/BaseText.vue'
import router from '@/router'
import { destroyToken } from '@/services/jwt'
import { useAuthStore } from '@/stores/auth'
import BaseAvatar from '../avatar/BaseAvatar.vue'
import ChangelogModal from '@/components/modals/changelog/ChangelogModal.vue'
import { getSidebarElements } from '@/config/sidebarElements'

const sidebarElements = computed<sidebarElement[]>(() => {
    return getSidebarElements()
})

const innerWidth = window.innerWidth
const openChangelogModal = ref<boolean>(false)
const isCollapsed = ref<boolean>(innerWidth < 640)
const authStore = useAuthStore()

const toggleCollapsed = () => {
    isCollapsed.value = !isCollapsed.value
}

const onLogout = async () => {
    await authStore.logout()
    destroyToken()
    authStore.resetState()
    router.push({
        name: AuthRoutesNames.LOGIN,
    })
}

const onIndex = async () => {
    router.push({
        name: RouterNames.DASHBOARD,
    })
}

const onOpenChangelogModal = () => {
    openChangelogModal.value = true
}

const onCloseChangelogModal = () => {
    openChangelogModal.value = false
}
</script>
