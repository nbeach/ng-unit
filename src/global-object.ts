import isNil = require("lodash/fp/isNil")

export function resolveGlobalObject(): any {
    try {
        if (!isNil(window)) { return window }
    } catch (exception) {}

    try {
        if (!isNil(global)) { return global }
    } catch (exception) {}

    return {}
}
