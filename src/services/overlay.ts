import {OverlayId} from "../enum/overlay";

export const buildPageNumber = (right: number, fontSize: number, text: string) => {
    return `<div style="position: absolute; bottom: 1px; right: ${right}mm; font-size: ${fontSize}px;" contenteditable="true">${text}</div>`
}

export const buildPageHeader = (
    content: string = '',
    top: number,
    left: number,
    right: number,
    height: number,
    maxHeight: number,
    contenteditable: boolean = true,
    isFirstPage: boolean = false,
    id: string = OverlayId.HEADER
) => {
    return `<div id="${id}" firstPage="${isFirstPage}" style="position: absolute; left: ${left}mm; top: ${top}; right: ${right}mm; height: ${height}mm; max-height: ${maxHeight}mm; overflow: hidden" contenteditable="${contenteditable}">${content}</div>`
}

export const buildPageFooter = (
    content: string = '',
    bottom: number,
    left: number,
    right: number,
    height: number,
    maxHeight: number,
    contenteditable: boolean = true,
    isFirstPage: boolean = false,
    id: string = OverlayId.FOOTER
) => {
    return `<div id="${id}" firstPage="${isFirstPage}" style="position: absolute; left: ${left}mm; right: ${right}mm; bottom: ${bottom}mm; height: ${height}mm; max-height: ${maxHeight}mm; overflow: hidden" contenteditable="${contenteditable}">${content}</div>`
}