import { Property } from "@/types/Editor"
import { Formats, TraslitterationFormat } from "@/enums/CustomElements"

export const distributeTextToNodes = (
    textNodes: Node[],
    newValue: string
): void => {
    let currentIndex: number = 0
    textNodes.forEach((node: Node, index: number): void => {
        const originalLength = node.textContent?.length || 0

        if (index === textNodes.length - 1) {
            node.textContent = newValue.substring(currentIndex)
        } else {
            node.textContent = newValue.substring(
                currentIndex,
                currentIndex + originalLength
            )
            currentIndex += originalLength
        }
    })
}

export const collectTextNodes = (node: Node, textNodes: Node[]): void => {
    if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.childNodes.forEach((childNode: ChildNode): void => {
            collectTextNodes(childNode, textNodes)
        })
    }
}

export const collectAndDistributeTextNodes = (
    node: HTMLElement | Node,
    newValue: string
): void => {
    const textNodes: Node[] = []

    node.childNodes.forEach((childNode: Node): void => {
        collectTextNodes(childNode, textNodes)
    })

    distributeTextToNodes(textNodes, newValue)
}

export const applyProperties = (
    element: HTMLElement,
    properties: Property[]
) => {
    properties.forEach((property) => {
        if (Formats[property.label]) {
            element.setAttribute(Formats[property.label], property.value)

            if (property.label == Formats.traslitteration) {
                if (property.value === TraslitterationFormat.SENTENCE_CASE) {
                    element.style.textTransform = 'none'
                    element.innerHTML =
                        element.innerHTML.charAt(0).toUpperCase() +
                        element.innerHTML.slice(1).toLowerCase()
                } else {
                    element.style.textTransform = ''
                }
            }
        }
    })
}

export const convertElementToSpan = (
    element: HTMLElement | Node,
    properties?: Property[]
): void => {
    if (
        element.nodeType !== Node.ELEMENT_NODE &&
        element.nodeType !== Node.TEXT_NODE
    ) {
        return
    }

    const parent = element.parentNode

    if (!parent) {
        return
    }

    const span = document.createElement('span')
    span.textContent = element.textContent

    if (properties) {
        properties.forEach((property) => {
            if (property.label == Formats.next_sentence) {
                span.textContent = span.textContent + ' ' + property.value
            }

            if (property.label == Formats.previous_sentence) {
                span.textContent = property.value + ' ' + span.textContent
            }
        })
    }

    parent.replaceChild(span, element)
}