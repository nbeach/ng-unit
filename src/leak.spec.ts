import {TestBed} from "@angular/core/testing";
import {queryComponent} from "./util/test/dom.util";
import {Component, EventEmitter, Output} from "@angular/core";
import {expect} from "./util/test/assertion.util";
import {range, keysIn} from "lodash";
import {stubComponent} from "./util/test/stubbing.util";
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from "@angular/platform-browser-dynamic/testing";


describe.skip("Memoery Leak", () => {
    afterEach(TestBed.resetTestingModule);


    it("leaks with almost nothing", () => {
        range(200000).forEach(iteration => {
            TestBed.configureTestingModule({declarations: [CommunicatingParent, CommunicatingChildComponent]});
        });
    });


    // it(`leaks with stubs`, function () {
    //     this.timeout(50000);
    //
    //     range(200000).forEach(iteration => {
    //         TestBed.configureTestingModule({declarations: [CommunicatingParent, stubComponent(CommunicatingChildComponent)]});
    //         // TestBed.configureTestingModule({ declarations: [CommunicatingParent, CommunicatingChildComponent] });
    //         const fixture = TestBed.createComponent(CommunicatingParent);
    //         const parentElement = fixture.debugElement.nativeElement;
    //
    //         const child = queryComponent(CommunicatingChildComponent, fixture);
    //         child.output.emit("bar");
    //         // child.output.complete();
    //         fixture.detectChanges();
    //         expect(parentElement.querySelector('#outputFromChild').textContent).to.equal("bar");
    //         TestBed.resetTestingModule();
    //     });
    //
    // });


    // it(`does not leak ${iteration}`, () => {
    //     TestBed.configureTestingModule({ declarations: [CommunicatingParent, CommunicatingChildComponent] });
    //     const fixture = TestBed.createComponent(CommunicatingParent);
    //     const parentElement = fixture.debugElement.nativeElement;
    //
    //     const child = queryComponent(CommunicatingChildComponent, fixture);
    //     // child.output.emit("bar");
    //     fixture.detectChanges();
    //     expect(parentElement.querySelector('#outputFromChild').textContent).to.equal("foo");
    // });


});

@Component({selector: 'child', template: '<div></div>'})
class CommunicatingChildComponent {
    @Output() private output = new EventEmitter<any>();
}

@Component({
    selector: 'parent',
    template: `
        <child (output)="outputFromChild = $event"></child>
        <div id="outputFromChild">{{outputFromChild}}</div>
    `
})
class CommunicatingParent {
    private outputFromChild: string = "foo";

}
