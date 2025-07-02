<template>
    <div
        class="initials-avatar"
        :class="{
            'h-4 w-4': size == '2xs',
            'h-6 w-6': size == 'xs',
            'h-8 w-8': size == 'sm',
            'h-10 w-10': size == 'md',
            'h-12 w-12': size == 'lg',
            'h-14 w-14': size == 'xl',
            'h-16 w-16': size == '2xl',
            'h-20 w-20': size == '3xl',
            'h-24 w-24': size == '4xl',
            'h-28 w-28': size == '5xl',
            'h-6 w-6 p-1': size == 'xs',
            'h-8 w-8 p-2': size == 'sm',
            'h-10 w-10 p-2': size == 'md',
            'h-14 w-14 p-3': size == 'lg',
            'h-15 w-15 p-3': size == 'xl',
            'h-16 w-16 p-3': size == '2xl',
            'h-20 w-20 p-3': size == '3xl',
            'h-24 w-24 p-3 ': size == '4xl',
            'h-28 w-28 p-3 ': size == '5xl',
        }"
        :style="avatarStyle"
    >
        {{ initials }}
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { defineProps, toRefs } from 'vue'

const props = withDefaults(
    defineProps<{
        name?: string
        size?:
            | '2xs'
            | 'xs'
            | 'sm'
            | 'md'
            | 'lg'
            | 'xl'
            | '2xl'
            | '3xl'
            | '4xl'
            | '5xl'
        backgroundColor?: string
    }>(),
    {
        name: '',
        size: 'md',
        backgroundColor: '',
    }
)

const { size, backgroundColor } = toRefs(props)

const initials = computed(() => {
    return props.name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) // Limit to 2 characters
})

const fontSizeMap = {
    '2xs': '8px',
    xs: '12px',
    sm: '16px',
    md: '24px',
    lg: '28px',
    xl: '40px',
    '2xl': '48px',
    '3xl': '56px',
    '4xl': '64px',
    '5xl': '72px',
}

const getRandomColor = () => {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

const avatarStyle = computed(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    backgroundColor: backgroundColor.value || getRandomColor(),
    color: '#fff',
    fontSize: fontSizeMap[size.value],
    fontWeight: 'bold',
    padding: '10px',
}))
</script>

<style scoped>
.initials-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: #ccc;
    color: #fff;
    font-weight: bold;
}
</style>
