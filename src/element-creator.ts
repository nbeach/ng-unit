function CreateElementException(message: string) {
    const exception = new Error("CreateElementException")
    exception.message = message

    return exception
}

export default function createElement(querySelector = "div", ...content: any[]) {
    const nodeType = querySelector.match(/^[a-z0-9\-]+/i)
    const id = querySelector.match(/#([a-z]+[a-z0-9-]*)/gi)
    const classes = querySelector.match(/\.([a-z]+[a-z0-9-]*)/gi)
    const attributes = querySelector.match(/\[([a-z][a-z-]+)(=['|"]?([^\]]*)['|"]?)?\]/gi)
    const node = (nodeType) ? nodeType[0] : "div"

    if (id && id.length > 1) {
        throw CreateElementException("only 1 ID is allowed")
    }

    const elt = document.createElement(node)

    if (id) {
        elt.id = id[0].replace("#", "")
    }

    if (classes) {
        const attrClasses = classes.join(" ").replace(/\./g, "")
        elt.setAttribute("class", attrClasses)
    }

    if (attributes) {
        attributes.forEach(item => {
            item = item.slice(0, -1).slice(1)
            let [label, value] = item.split("=")
            if (value) {
                value = value.replace(/^['"](.*)['"]$/, "$1")
            }
            elt.setAttribute(label, value || "")
        })
    }

    content.forEach(item => {
        if (typeof item === "string" || typeof item === "number") {
            elt.appendChild(document.createTextNode(item))
        } else if (item.nodeType === document.ELEMENT_NODE) {
            elt.appendChild(item)
        }
    })

    return elt
}

