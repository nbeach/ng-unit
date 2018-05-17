import {isNil} from "lodash"
import {first} from "function-composition"

function match(value: string, regex: RegExp): string[] {
    const matches = value.match(regex)
    return matches === null ? [] : matches
}

function createNode(tagName?: string) {
    return document.createElement(tagName ? tagName : "div")
}

function addId(id?: string) {
    return (element: HTMLElement) => {
        if (!isNil(id)) {
            element.id = id
        }
        return element
    }
}

function remove(removal: string) {
    return (value: string) => value.replace(removal, "")
}

function addClasses(classes: string[]) {
    return (element: HTMLElement) => {
        element.setAttribute("class", classes.join(" "))
        return element
    }
}

function addAttributes(attributes: string[]) {
    return (element: HTMLElement) => {
        attributes.forEach(item => {
            item = item.slice(0, -1).slice(1)

            const itemParts = item.split("=")
            const label = itemParts[0]
            let value = itemParts[1]

            if (value) {
                value = value.replace(/^['"](.*)['"]$/, "$1")
            }
            element.setAttribute(label, value || "")
        })
        return element
    }
}

export default function createElement(querySelector: string): Element {
    const [tagName] = match(querySelector, /^[a-z0-9-]+/i)
    const [id] = match(querySelector, /#([a-z]+[a-z0-9-]*)/gi).map(remove("#"))
    const classes = match(querySelector, /\.([a-z]+[a-z0-9-]*)/gi).map(remove("."))
    const attributes = match(querySelector, /\[([a-z][a-z-]+)(=['|"]?([^\]]*)['|"]?)?\]/gi)

    return first(createNode)
        .then(addId(id))
        .then(addClasses(classes))
        .then(addAttributes(attributes))
        .apply(tagName)
}

