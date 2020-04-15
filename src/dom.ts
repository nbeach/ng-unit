import {ComponentFixture} from "@angular/core/testing"
import {isNil, isString, findIndex} from "lodash"
import {By} from "@angular/platform-browser"
import {selectorOf} from "./selector-of"
import {Type} from "@angular/core"
import { isEqual } from "lodash"

function doIfElementPresent<T>(element: T | null, action: (item: T) => void) {
    if (isNil(element)) {
        throw new Error("Element is not present")
    } else {
        action(element)
    }
}

export function setTextInputValue(input: Element | null, value: string): void {
    doIfElementPresent(input, input => {
        (input as HTMLInputElement).value = value
        trigger(input, "input")
        trigger(input, "change")
    })
}

export function setSelectIndex(selectBox: Element | null, index: number): void {
    doIfElementPresent(selectBox, selectBox => {
        (selectBox as any).selectedIndex = index
        trigger(selectBox, "change")
    })
}

export function setSelectValue(selectBox: Element | null, value: string): void {
    doIfElementPresent(selectBox, selectBox => {
        const index = findIndex(selectBox.children, option => option.getAttribute("value") === value || option.textContent === value)
        setSelectIndex(selectBox, index)
    })
}

export function setSelectFromOptions(selectBox: Element | null, optionToSelection: any, allOptions: any[]): void {
    doIfElementPresent(selectBox, selectBox => {
        const index = findIndex(allOptions, option => isEqual(option, optionToSelection))
        setSelectIndex(selectBox, index)
    })
}

export const setTextAreaValue = setTextInputValue

export function setCheckboxValue(input: Element | null, checked: boolean): void {
    doIfElementPresent(input, input => {
        (input as HTMLInputElement).checked = checked
        trigger(input, "change")
    })
}

export function setRadioButton(radioButton: Element | null, selected: boolean): void {
    doIfElementPresent(radioButton, radioButton => {
        (radioButton as HTMLInputElement).checked = selected
        trigger(radioButton, "change")
    })
}

export interface EventProperties {
    [key: string]: any
}

export function trigger(element: Node | null, eventType: string, eventProperties: EventProperties = {}): void {
    doIfElementPresent(element, element => {
        try {
            const event: any = new Event(eventType, { bubbles: true, cancelable: true  })
            element.dispatchEvent(Object.assign(event, eventProperties))
        } catch (exception) {
            // IE11 Fix
            if (exception.description === "Object doesn't support this action") {
                const event = document.createEvent("MouseEvent")
                event.initMouseEvent(
                    eventType,
                    true,
                    true,
                    window,
                    eventProperties.detail || 0,
                    eventProperties.screenX || 0,
                    eventProperties.screenY || 0,
                    eventProperties.clientX || 0,
                    eventProperties.clientY || 0,
                    eventProperties.ctrlKey || false,
                    eventProperties.altKey || false,
                    eventProperties.shiftKey || false,
                    eventProperties.metaKey || false,
                    eventProperties.button || 0,
                    eventProperties.relatedTarget || null)

                element.dispatchEvent(Object.assign(event, eventProperties))

            } else {
                throw exception
            }
        }
    })
}

function resolveSelector(selectorOrConstructor: string | Type<any>): string {
    return isString(selectorOrConstructor) ? selectorOrConstructor : selectorOf(selectorOrConstructor)
}

export function selectComponent<T, S>(selectorOrConstructor: string | Type<S>, fixture: ComponentFixture<T>): S | any | null {
    const selector = resolveSelector(selectorOrConstructor)
    const element = fixture.debugElement.query(By.css(selector))
    return isNil(element) ? null : element.componentInstance
}

export function selectComponents<T, S>(selectorOrConstructor: string | Type<S>, fixture: ComponentFixture<T>): (S | any)[] {
    const selector = resolveSelector(selectorOrConstructor)
    return fixture.debugElement.queryAll(By.css(selector)).map(element => element.componentInstance)
}

