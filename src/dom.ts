import {ComponentFixture} from "@angular/core/testing";
import {isString} from "lodash";
import {By} from "@angular/platform-browser";
import {selectorOf} from "./selector-of";

export function setInputValue<T>(element: any, value: string): void {
    element.value = value;
    element.dispatchEvent(new Event('input'));
    element.dispatchEvent(new Event('change'));
}

export function setSelectValue<T>(element: any, value: string): void {
    element.value = value;
    element.dispatchEvent(new Event('change'));
}

export const setTextAreaValue = setInputValue;

export function setCheckboxValue<T>(element: any, checked: boolean): void {
    if(checked) {
        element.setAttribute("checked", "");
    } else {
        element.removeAttribute("checked");
    }

    element.dispatchEvent(new Event("change"));
}

export function setRadioButton<T>(element: any, selected: boolean): void {
    element.checked = selected;
    element.dispatchEvent(new Event("change"));
}

export function selectComponent<T>(selectorOrConstructor: string | any, fixture: ComponentFixture<T>): any {
    const selector = isString(selectorOrConstructor) ? selectorOrConstructor : selectorOf(selectorOrConstructor);
    return fixture.debugElement.query(By.css(selector)).componentInstance;
}

export function selectComponents<T>(selectorOrConstructor: string | any, fixture: ComponentFixture<T>): any[] {
    const selector = isString(selectorOrConstructor) ? selectorOrConstructor : selectorOf(selectorOrConstructor);
    return fixture.debugElement.queryAll(By.css(selector)).map(element => element.componentInstance);
}