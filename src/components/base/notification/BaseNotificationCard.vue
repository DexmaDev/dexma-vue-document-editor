<template>
    <div
        :class="{
            'bg-secondary-200':
                type === NotificationType.INFO && !notification.redAt,
            'bg-error-200':
                type === NotificationType.ERROR && !notification.redAt,
            'bg-success-200':
                type === NotificationType.SUCCESS && !notification.redAt,
            'bg-warning-200':
                type === NotificationType.WARNING && !notification.redAt,
            'bg-secondary-50':
                type === NotificationType.INFO && notification.redAt,
            'bg-error-50':
                type === NotificationType.ERROR && notification.redAt,
            'bg-success-50':
                type === NotificationType.SUCCESS && notification.redAt,
            'bg-warning-50':
                type === NotificationType.WARNING && notification.redAt,
        }"
        class="flex w-full max-w-xl cursor-pointer gap-4 rounded-lg border p-3 shadow"
        @click="emit('onNotificationClick', notification)"
    >
        <div
            v-if="!notification.redAt"
            class="flex items-center justify-center"
        >
            <div
                :class="{
                    'bg-secondary-500': type === NotificationType.INFO,
                    'bg-error-500': type === NotificationType.ERROR,
                    'bg-success-500': type === NotificationType.SUCCESS,
                    'bg-warning-500': type === NotificationType.WARNING,
                }"
                class="h-3 w-3 animate-pulse rounded-full"
            />
        </div>
        <div class="flex w-full flex-col gap-2">
            <div class="flex justify-between">
                <BaseText
                    :text="t(notification.titleKey, notification.titleInfo)"
                    font="bold"
                    type="p-md"
                />

                <BaseText
                    :text="utcToLocalDateFromNow(notification.createdAt)"
                    font="regular"
                    type="p-sm"
                />
            </div>
            <div>
                <BaseText
                    :text="
                        t(
                            notification.descriptionKey,
                            notification.descriptionInfo
                        )
                    "
                    font="regular"
                    type="p-sm"
                />
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import Notification from '@/types/notification'
import { NotificationType } from '@/enums/NotificationType'
import BaseText from '@/components/base/text/BaseText.vue'
import { t } from '@/services/i18n'
import { utcToLocalDateFromNow } from '@/services/utils'

defineProps<{
    notification: Notification
    type: NotificationType
}>()

const emit = defineEmits(['onNotificationClick'])
</script>
