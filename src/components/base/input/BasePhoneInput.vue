<template>
    <div class="w-full">
        <div v-if="label">
            <BaseText
                :text="label"
                :tone="700"
                color="neutral"
                font="bold"
                type="p-sm"
            />
        </div>
        <div class="relative mb-1 mt-1.5">
            <div class="flex item-center flex-wrap md:flex-nowrap">
                <div class="w-full md:w-20 flex">
                    <base-dropdown @on-close="onDropdownClose">
                        <template #button>
                            <div
                                :class="
                                    status === 'error'
                                        ? 'error'
                                        : status === 'success'
                                          ? 'success'
                                          : 'default'
                                "
                                class="w-full border rounded-tl-lg rounded-tr-lg md:rounded-tr-none md:rounded-bl-lg border-neutral-300 py-1.5 pl-3 text-base text-neutral-900 cursor-pointer"
                                @click="showDropdown"
                            >
                                <div
                                    class="inline-flex justify-between w-full px-1 items-center"
                                >
                                    <img
                                        :src="getCurrentFlagIcon()"
                                        alt="country-flag"
                                        class="w-4 h-4"
                                    />
                                    <BaseIcon name="chevron-down" size="sm" />
                                </div>
                            </div>
                        </template>
                        <template #content="{ close }">
                            <div
                                ref="countriesListElRef"
                                class="w-40 border border-neutral-300 rounded-lg absolute z-10 bg-white shadow-lg h-96 overflow-auto -top-3"
                                @click="close"
                            >
                                <div
                                    v-for="country in countryStore.countries"
                                    :id="'code-' + country.isoCode"
                                    :key="country.isoCode"
                                    :class="[
                                        currentPrefix === country.prefix &&
                                            'bg-neutral-200',
                                        'flex justify-between items-center py-1 px-4 hover:bg-neutral-200 cursor-pointer',
                                    ]"
                                    @click="selectCountry(country)"
                                >
                                    <img
                                        :src="getFlagPath(country.isoCode)"
                                        alt="country-flag"
                                        class="w-4 h-4 inline-block"
                                    />
                                    {{ country.prefix }}
                                </div>
                            </div>
                        </template>
                    </base-dropdown>
                </div>
                <div class="relative w-full flex text-nowrap">
                    <input
                        :id="idName + '-prefix'"
                        ref="input"
                        :class="
                            status === 'error'
                                ? 'error'
                                : status === 'success'
                                  ? 'success'
                                  : 'default'
                        "
                        :disabled="disabled"
                        name="prefix"
                        :required="required"
                        :value="prefix"
                        class="max-w-20 text-center text-base border-l border-b rounded-bl-lg md:border-t md:rounded-bl-none md:border-l-0 border-neutral-300 text-neutral-700 py-1.5 pl-3 px-2"
                        type="text"
                        @input="handlePrefixInput"
                    />
                    <input
                        :id="idName"
                        ref="input"
                        :class="
                            status === 'error'
                                ? 'error'
                                : status === 'success'
                                  ? 'success'
                                  : 'default'
                        "
                        :disabled="disabled"
                        :name="name"
                        :placeholder="placeholder"
                        :required="required"
                        :value="phone"
                        class="w-full border-l-0 rounded-br-lg md:rounded-tr-lg border-neutral-300 py-1.5 pl-3 text-base text-neutral-900 focus:ring-2 transition-all duration-300"
                        type="text"
                        @input="handlePhoneInput"
                    />
                    <div
                        v-if="iconName"
                        class="absolute right-3.5 top-2 cursor-pointer"
                        @click.prevent="$emit('onClickIcon')"
                    >
                        <BaseIcon :name="iconName" />
                    </div>
                </div>
            </div>
        </div>
        <div v-if="Array.isArray(hintMessage)">
            <BaseText
                v-for="(message, i) in hintMessage"
                :key="`hint-message-${i}`"
                :color="
                    status === 'error'
                        ? 'error'
                        : status === 'success'
                          ? 'success'
                          : 'neutral'
                "
                :text="message"
                font="medium"
                type="p-sm"
            />
        </div>
        <div v-else-if="hintMessage">
            <BaseText
                :color="
                    status === 'error'
                        ? 'error'
                        : status === 'success'
                          ? 'success'
                          : 'neutral'
                "
                :text="hintMessage"
                font="medium"
                type="p-sm"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import BaseText from '@/components/base/text/BaseText.vue'
import BaseIcon from '@/components/base/icon/BaseIcon.vue'
import { defineEmits, defineProps, nextTick, onMounted, ref, watch } from 'vue'
import { useCountryStore } from '@/stores/country'
import { Icons } from '@/types/styles'
import Country from '@/types/country'
import BaseDropdown from '@/components/base/dropdown/BaseDropdown.vue'
import { getPhonePrefix } from '@/services/address'

const emit = defineEmits(['update:prefix', 'update:phone', 'onClickIcon'])

const dropdownOpen = ref(false)
const countryStore = useCountryStore()
const countryCode = ref('')
const currentPrefix = ref('')
const currentPhone = ref('')

const props = withDefaults(
    defineProps<{
        idName?: string
        placeholder?: string
        name?: string
        required?: boolean
        label?: string
        prefix?: string
        phone?: string
        hintMessage?: string | string[]
        iconName?: Icons
        status?: 'default' | 'error' | 'success'
        disabled?: boolean
        isOnFocus?: boolean
    }>(),
    {
        idName: undefined,
        placeholder: undefined,
        name: undefined,
        required: undefined,
        label: undefined,
        phone: undefined,
        hintMessage: undefined,
        iconName: undefined,
        status: undefined,
        disabled: undefined,
        prefix: '+39',
    }
)
const input = ref()

const countriesListElRef = ref<HTMLDivElement | null>()
const isPressing = ref(false)

onMounted(async () => {
    if (props.isOnFocus) {
        await nextTick()
        input.value.focus()
    }

    await countryStore.index()
    if (props.prefix) {
        currentPrefix.value = props.prefix
        if (props.phone) {
            currentPhone.value = props.phone
        }
    } else {
        currentPrefix.value = '+39'
        if (props.phone) {
            transformPhoneInput(props.phone)
        }
    }
    selectCountryByPrefix(countryStore.countries, currentPrefix.value)
})

watch(
    () => props.prefix,
    (newVal, oldVal) => {
        if (newVal != oldVal && newVal != currentPrefix.value) {
            currentPrefix.value = props.prefix
            selectCountryByPrefix(countryStore.countries, currentPrefix.value)
        }
    }
)
const getCurrentFlagIcon = (): string => {
    const countries = countryStore.countries
    if (!countries.length) {
        return ''
    }

    const country = countries.find(
        (option) =>
            option.isoCode.toLowerCase() === countryCode.value.toLowerCase()
    )

    return getFlagPath(country?.isoCode ?? '')
}

const getFlagPath = (isoCode: string): string => {
    return `/images/flags/${isoCode}.svg`
}

const showDropdown = (): void => {
    dropdownOpen.value = true

    if (currentPrefix.value) {
        scrollToCountry(countryCode.value)
    }
}

const hideDropdown = (): void => {
    dropdownOpen.value = false
}

const selectCountry = (country: Country, closeDropdown = true): void => {
    countryCode.value = country.isoCode
    currentPrefix.value = country.prefix

    emit('update:prefix', currentPrefix.value)

    if (closeDropdown) {
        hideDropdown()
    }
}

const selectCountryByPrefix = (
    countries: Country[],
    prefix: string,
    closeDropdown = true
): Country | undefined => {
    const country = countries.find((c) => c.prefix === prefix)
    if (country) {
        selectCountry(country, closeDropdown)
    }
    return country
}

const scrollToCountry = (countryCode: string): void => {
    const countryEl = countriesListElRef.value?.querySelector(
        `#code-${countryCode}`
    )
    if (countryEl) {
        setTimeout(() => {
            countriesListElRef.value?.scroll({
                top: (countryEl as HTMLDivElement).offsetTop,
                left: (countryEl as HTMLDivElement).offsetLeft,
            })
        }, 100)
    }
}

const handlePhoneInput = (inputEvent: Event): void => {
    currentPhone.value = (inputEvent.target as HTMLInputElement).value
    transformPhoneInput(currentPhone.value)
    emit('update:phone', currentPhone.value)
}

const transformPhoneInput = (phoneNumber: string): void => {
    const prefixMatch = phoneNumber.match(/^\+\d[\d-]* /)
    const prefix = prefixMatch ? cleanWhitespace(prefixMatch[0]) : ''
    if (prefix) {
        handlePrefixFound(prefix, phoneNumber)
    } else {
        handlePrefixNotFound(phoneNumber)
    }
}
const cleanWhitespace = (phoneNumber: string): string => {
    return phoneNumber.replace(/\s+/g, '')
}
const handlePrefixFound = (prefix: string, phoneNumber: string): void => {
    const country = selectCountryByPrefix(countryStore.countries, prefix)
    if (country) {
        selectCountry(country)
        currentPhone.value = phoneNumber.slice(prefix.length + 1)

        emit('update:phone', currentPhone.value)
    }
}

const handlePrefixNotFound = (phoneNumber: string): void => {
    const prefix = getPhonePrefix(
        countryStore.countries,
        phoneNumber.replace(/\s+/g, '')
    )
    if (prefix) {
        selectCountryByPrefix(countryStore.countries, prefix)
        currentPhone.value = phoneNumber.slice(prefix.length)
        emit('update:phone', currentPhone.value)
    }
}

const handlePrefixInput = (inputEvent: Event): void => {
    currentPrefix.value = (inputEvent.target as HTMLInputElement).value

    if (!currentPrefix.value.startsWith('+')) {
        currentPrefix.value = '+' + currentPrefix.value
    }

    if (currentPrefix.value) {
        const country = selectCountryByPrefix(
            countryStore.countries,
            currentPrefix.value
        )
        if (country) {
            selectCountry(country)
        }
    }

    emit('update:prefix', currentPrefix.value)
}

const onDropdownClose = (): void => {
    dropdownOpen.value = false
}

const onKeyPress = (e) => {
    if (isNaN(parseInt(e.key)) && e.key !== '-' && e.key !== 'Backspace') {
        return
    }

    if (!isPressing.value) {
        currentPrefix.value = '+'
        isPressing.value = true
    }

    if (currentPrefix.value.replace('+', '').replace('-', '').length >= 6) {
        return
    }

    if (e.key === 'Backspace') {
        if (currentPrefix.value.length === 1) {
            return
        }

        currentPrefix.value = currentPrefix.value.slice(0, -1)
    } else {
        currentPrefix.value += String(e.key)
    }

    selectCountryByPrefix(countryStore.countries, currentPrefix.value, false)
    scrollToCountry(countryCode.value)
}

watch(dropdownOpen, (newVal) => {
    if (newVal) {
        window.addEventListener('keyup', onKeyPress)
    } else {
        isPressing.value = false
        window.removeEventListener('keyup', onKeyPress)
    }
})
</script>

<style scoped>
.default {
    @apply border-neutral-300 focus:border-primary-400 focus:ring-blue-200;
}

.error {
    @apply border-error-300 focus:border-error-400 focus:ring-error-200;
}

.success {
    @apply border-success-300 focus:border-success-400 focus:ring-success-200;
}
</style>
