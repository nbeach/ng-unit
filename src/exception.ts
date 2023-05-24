import lodash from "lodash"
const {includes, isNil} = lodash

export function throwIfNil(value: any, error: string): void {
    if (isNil(value)) {
        throw new Error(error)
    }
}

export function throwIfNotIn(value: any, list: any[], message: string) {
    if (list.length === 0 || !includes(value, list)) {
        throw new Error(message)
    }
}

