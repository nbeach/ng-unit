import {ComponentFixture} from "@angular/core/testing";
import {isString, isNil} from "lodash";
import {By} from "@angular/platform-browser";
import {selectorOf} from "./selector-of";
import {Type} from "@angular/core";

function doIfElementPresent<T>(element: T | null, action: (item: T) => void) {
    if(isNil(element)) {
        throw new Error("Element is not present");
    } else {
        action(element);
    }
}

export function setInputValue<T>(input: HTMLInputElement | null, value: string): void {
    doIfElementPresent(input, input => {
        input.value = value;
        trigger(input, 'input');
        trigger(input, 'change');
    });
}

export function setSelectValue<T>(selecBox: HTMLSelectElement | null, value: string): void {
    doIfElementPresent(selecBox, selectBox => {
        selectBox.value = value;
        trigger(selectBox, 'change');
    });
}

export const setTextAreaValue = setInputValue;

export function setCheckboxValue<T>(input: HTMLInputElement | null, checked: boolean): void {
    doIfElementPresent(input, input => {
        if (checked) {
            input.setAttribute("checked", "");
        } else {
            input.removeAttribute("checked");
        }

        trigger(input, 'change');
    });
}

export function setRadioButton<T>(radioButton: HTMLInputElement | null, selected: boolean): void {
    doIfElementPresent(radioButton, radioButton => {
        radioButton.checked = selected;
        trigger(radioButton, 'change');
    });
}

export function trigger(element: Element | null, eventType: string): void {
    doIfElementPresent(element, element => {
        element.dispatchEvent(new Event(eventType));
    });
}

export function selectComponent<T, S>(selectorOrConstructor: string | Type<S>, fixture: ComponentFixture<T>): S | any {
    const selector = isString(selectorOrConstructor) ? selectorOrConstructor : selectorOf(selectorOrConstructor);
    return fixture.debugElement.query(By.css(selector)).componentInstance;
}

export function selectComponents<T, S>(selectorOrConstructor: string | Type<S>, fixture: ComponentFixture<T>): (S | any)[] {
    const selector = isString(selectorOrConstructor) ? selectorOrConstructor : selectorOf(selectorOrConstructor);
    return fixture.debugElement.queryAll(By.css(selector)).map(element => element.componentInstance);
}

