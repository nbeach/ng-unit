import isNil = require("lodash/fp/isNil")
import includes = require("lodash/fp/includes")

/**
 * @ignore
 */
export function throwIfNil(value: any, error: string): void {
    if (isNil(value)) {
        throw new Error(error)
    }
}

/**
 * @ignore
 */
export function throwIfNotIn(value: any, list: any[], message: string) {
    if (!includes(value, list)) {
        throw new Error(message)
    }
}

