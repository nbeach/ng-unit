import {isNil, isNull, isUndefined} from "lodash"
import {first} from "function-composition"

function match(value: string, regex: RegExp): string[] {
    const matches = value.match(regex)
    return matches === null ? [] : matches
}

function extract(value: string, pattern: RegExp): string | undefined {
    const matches = value.match(pattern)
    return isNull(matches) ? undefined : matches[1]
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
    return (element: HTMLElement) => addAttribute(element, "class", classes.join(" "))
}

function addAttributes(attributesStrings: string[]) {
    return (element: HTMLElement) => attributesStrings
        .map(attributeString => extract(attributeString, /^\[(.*)\]+/i))
        .map(attributeStringWithoutBrackets =>  attributeStringWithoutBrackets!.split("="))
        .map(([name, value]) => [name, !isUndefined(value) ? extract(value, /^['"](.*)['"]$/) : ""])
        .reduce((element, [name, valueWithoutQuotes]) => addAttribute(element, name!, valueWithoutQuotes!), element)
}

function addAttribute(element: HTMLElement, attribute: string, value: string): HTMLElement {
    element.setAttribute(attribute, value)
    return element
}

export default function createElement(querySelector: string): Element {
    const tagName = extract(querySelector, /^([a-z0-9-]+)/i)
    const [id] = match(querySelector, /#([a-z]+[a-z0-9-]*)/gi).map(remove("#"))
    const classes = match(querySelector, /\.([a-z]+[a-z0-9-]*)/gi).map(remove("."))
    const attributes = match(querySelector, /\[([a-z][a-z-]+)(=['|"]?([^\]]*)['|"]?)?\]/gi)

    return first(createNode)
        .then(addId(id))
        .then(addClasses(classes))
        .then(addAttributes(attributes))
        .apply(tagName)
}

