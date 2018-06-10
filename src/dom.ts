import {ComponentFixture} from "@angular/core/testing"
import {isNil, isString, findIndex} from "lodash"
import {By} from "@angular/platform-browser"
import {selectorOf} from "./selector-of"
import {Type} from "@angular/core"

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


export function setSelectValue(selectBox: Element | null, value: string): void {
    doIfElementPresent(selectBox, selectBox => {
        (selectBox as any).selectedIndex = findIndex(selectBox.children, option =>
            option.getAttribute("value") === value || option.textContent === value)

        trigger(selectBox, "change")
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

export function trigger(element: Node | null, eventType: string): void {
    doIfElementPresent(element, element => {
        try {
            element.dispatchEvent(new Event(eventType, { bubbles: true }))
        } catch (exception) {
            // IE11 Fix
            if (exception.description === "Object doesn't support this action") {
                const event = document.createEvent("MouseEvent")
                event.initMouseEvent(
                    eventType,
                    true,
                    true,
                    window,
                    0,
                    0,
                    0,
                    0,
                    0,
                    false,
                    false,
                    false,
                    false,
                    0,
                    null)
                element.dispatchEvent(event)

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

