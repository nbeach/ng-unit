import {ComponentFixture, TestBed} from "@angular/core/testing";
import {Type} from "@angular/core";
import {concat, defaultTo} from 'lodash';
import {selectComponent, selectComponents} from "./dom";
import {mockComponent, MockSetup} from "./mock-component";

export class ComponentTestContext<T> {
    constructor(private _fixture: ComponentFixture<T>) {}

    public element = (selector: string): Element | null => this._fixture.nativeElement.querySelector(selector);
    public elements = (selector: string): NodeListOf<Element> => this._fixture.nativeElement.querySelectorAll(selector);
    public child = <T>(selectorOrType: string | Type<T>): T => selectComponent(selectorOrType, this._fixture);
    public children = <T>(selectorOrType: string | Type<T>): T[] => selectComponents(selectorOrType, this._fixture);
    public detectChanges = () : void => this._fixture.detectChanges();

    get subject(): T {
        return this._fixture.componentInstance
    }

    get subjectElement(): Element {
        return this._fixture.nativeElement;
    }

    get fixture(): ComponentFixture<T> {
        return this._fixture;
    }

}

export interface TestConfig<T> {
    subject: Type<T>
    mock?: Type<any>[];
    use?: Type<any>[];
    methodMockFactory?: () => any;
}

interface MockTypeAndSetup {
    type: Type<any>,
    setup: MockSetup
}

export class TestBuilder<T> {
    private mockSets: MockTypeAndSetup[] = [];

    public static configure<T>(config: TestConfig<T>) {
        return new TestBuilder(config);
    }

    private constructor(private config: TestConfig<T>) { }

    public setupMock(type: Type<any>, setup: (mock: any) => void): TestBuilder<T> {
        this.mockSets.push({type: type, setup: setup});
        return this;
    }

    // public input(): TestBuilder<T> {
    //     return this;
    // }

    public create(): ComponentTestContext<T> {
        const realComponents = defaultTo(this.config.use, []);
        const mockComponents = defaultTo(this.config.mock, [])
            .map(type => this.createComponentMock(type, this.mockSets));

        TestBed.configureTestingModule({
            declarations: concat(this.config.subject, mockComponents, realComponents),
        });

        const fixture = TestBed.createComponent(this.config.subject);
        fixture.detectChanges();

        return new ComponentTestContext(fixture);
    }

    private createComponentMock<T>(type: Type<T>, setup: MockTypeAndSetup[]): Type<T> {
        const relevantMockSetups = setup
            .filter(set => set.type === type)
            .map(set => set.setup);

        return mockComponent(type,  mock => this.applyMockSetups(mock, relevantMockSetups));
    }

    private applyMockSetups(mock: any, mockSetups: MockSetup[]): void {
        mockSetups.forEach(setup => setup(mock));
    }

}

