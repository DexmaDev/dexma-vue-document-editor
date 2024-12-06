export const buildOverlayBlock = (
    {
        content = '',
        left = 'unset',
        right = 'unset',
        height = 'unset',
        maxHeight = 'unset',
        width = 'unset',
        top = 'unset',
        bottom = 'unset',
        fontSize = 'unset',
        contenteditable = true,
        isFirstPage = false,
        id,
    }: {
        content?: string
        left?: number | string
        right?: number | string
        height?: number | string
        maxHeight?: number | string
        width?: number | string
        top?: number | string
        bottom?: number | string
        fontSize?: number | string
        contenteditable?: boolean
        isFirstPage?: boolean
        id?: string
    }): string => {
    return `<div id="${id}" firstPage="${isFirstPage}" style="
        font-size: ${typeof fontSize == 'number' ? fontSize.toString() + 'px' : fontSize};
        position: absolute; 
        right: ${typeof right == 'number' ? right.toString() + 'mm' : right}; 
        left: ${typeof left == 'number' ? left.toString() + 'mm' : left};
        top: ${typeof top == 'number' ? top.toString() + 'mm' : top};
        bottom: ${typeof bottom == 'number' ? bottom.toString() + 'mm' : bottom}; 
        height: ${typeof height == 'number' ? height.toString() + 'mm' : height};
        max-height: ${typeof maxHeight == 'number' ? maxHeight.toString() + 'mm' : maxHeight}; 
        width: ${typeof width == 'number' ? width.toString() + 'mm' : width};
        overflow: hidden" contenteditable="${contenteditable}">
            ${content}
        </div>`
}
