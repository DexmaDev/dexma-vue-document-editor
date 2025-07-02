import { Property } from '@/types/Editor'
import {
    applyProperties,
    collectAndDistributeTextNodes,
    convertElementToSpan,
} from './domManipulation'

const updateCustomTag = ({
    customTag,
    newValue,
    properties = undefined,
    transformIntoPlainText = false,
}: {
    customTag: HTMLElement | Node
    newValue: string
    properties?: Property[]
    transformIntoPlainText?: boolean
}): void => {
    collectAndDistributeTextNodes(customTag, newValue)

    if (properties) {
        applyProperties(customTag as HTMLElement, properties)
    }

    if (transformIntoPlainText) {
        convertElementToSpan(customTag, properties)
    }
}

export const updateCustomTagContent = ({
    modelValue,
    customTag,
    newValue,
    properties = undefined,
    transformIntoPlainText = false,
    replaceAllSiblings = false,
}: {
    modelValue: string[]
    customTag: HTMLElement
    newValue: string
    properties?: Property[]
    transformIntoPlainText?: boolean
    replaceAllSiblings?: boolean
}): string[] => {
    const tagId = customTag.getAttribute('id')
    if (!tagId) return modelValue

    const container = document.createElement('div')

    modelValue.forEach((value) => {
        const wrapper = document.createElement('div')
        wrapper.className = 'value-container'
        wrapper.innerHTML = value
        container.appendChild(wrapper)
    })

    if (!replaceAllSiblings) {
        const tag = container.querySelector<HTMLElement>(
            `a.custom-tag[id="${tagId}"]`
        )
        if (!tag) return modelValue

        updateCustomTag({
            customTag: tag,
            newValue: newValue,
            properties: properties,
            transformIntoPlainText: transformIntoPlainText,
        })
    } else {
        const tags = container.querySelectorAll<HTMLElement>(
            `a.custom-tag[id="${tagId}"]`
        )
        if (tags.length == 0) return modelValue
        tags.forEach((tag) => {
            updateCustomTag({
                customTag: tag,
                newValue: newValue,
                properties: properties,
                transformIntoPlainText: transformIntoPlainText,
            })
        })
    }

    const valueContainers = container.querySelectorAll('.value-container')

    const newModelValue: string[] = []
    valueContainers.forEach((valueContainer) => {
        newModelValue.push(valueContainer.innerHTML)
    })
    return newModelValue
}
