export default function createElement(querySelector: string, ...content: any[]) {
    const nodeType = querySelector.match(/^[a-z0-9\-]+/i)
    const id = querySelector.match(/#([a-z]+[a-z0-9-]*)/gi)
    const classes = querySelector.match(/\.([a-z]+[a-z0-9-]*)/gi)
    const attributes = querySelector.match(/\[([a-z][a-z-]+)(=['|"]?([^\]]*)['|"]?)?\]/gi)
    const node = (nodeType) ? nodeType[0] : "div"

    const element = document.createElement(node)

    if (id) {
        if (id.length > 1) {
            throw new Error("CreateElementException: only 1 ID is allowed")
        }
        element.id = id[0].replace("#", "")
    }

    if (classes) {
        const attrClasses = classes.join(" ").replace(/\./g, "")
        element.setAttribute("class", attrClasses)
    }

    if (attributes) {
        attributes.forEach(item => {
            item = item.slice(0, -1).slice(1)
            let [label, value] = item.split("=")
            if (value) {
                value = value.replace(/^['"](.*)['"]$/, "$1")
            }
            element.setAttribute(label, value || "")
        })
    }

    content.forEach(item => {
        if (typeof item === "string" || typeof item === "number") {
            element.appendChild(document.createTextNode(item))
        } else if (item.nodeType === document.ELEMENT_NODE) {
            element.appendChild(item)
        }
    })

    return element
}

