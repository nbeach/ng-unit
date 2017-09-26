import {ComponentFixture, TestBed, TestModuleMetadata} from "@angular/core/testing";
import {DebugElement, Type} from "@angular/core";

export class TestComponentContext<T> {
    readonly fixture: ComponentFixture<T>;
    readonly subject: T;
    readonly subjectElement: any;
    readonly debugElement: DebugElement;
    readonly detectChanges: (checkNoChanges?: boolean) => void;

    constructor(fixture: ComponentFixture<T>) {
        this.fixture = fixture;
        this.subject = fixture.componentInstance;
        this.subjectElement = fixture.nativeElement;
        this.debugElement = fixture.debugElement;
        this.detectChanges = fixture.detectChanges.bind(this.fixture);
    }
}

export function createComponent<T>(component: Type<T>, moduleConfig: TestModuleMetadata): TestComponentContext<T> {
    moduleConfig.declarations.push(component);
    TestBed.configureTestingModule(moduleConfig);
    const fixture = TestBed.createComponent(component);

    return new TestComponentContext(fixture);
}

