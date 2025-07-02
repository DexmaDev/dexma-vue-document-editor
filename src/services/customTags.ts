import { Property } from "@/DocumentEditor/types/Editor"
import { applyProperties, collectAndDistributeTextNodes, convertElementToSpan } from "./domManipulation"

export const updateCustomTagContent = (
    customTag: HTMLElement,
    newValue: string,
    properties?: Property[],
    transformIntoPlainText?: boolean,
    updateContent: boolean = true
): void => {
    collectAndDistributeTextNodes(customTag, newValue)

    if (properties) {
        applyProperties(customTag, properties)
    }

    if (transformIntoPlainText) {
        convertElementToSpan(customTag, properties)
    }

    // if (updateContent) {
    //     this.updateContentFromPages()
    // }
}
