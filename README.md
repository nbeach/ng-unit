# mocha-where
Parameteration for Mocha tests.

### Usage
```typescript
import {where} from "mocha-where";
 
where([
    ['first', 'second', 'expected'],
    [1,       2,        3         ]
])
.it("#first plus #second equals #expected", (scenario: any) => {
    expect(scenario.first + scenario.second).to.equal(scenario.expected);
});
 
 
const add = (a: number, b: number) => a + b;
const exponent = (a: number, b: number) => Math.pow(a,b);

where([
    ['name',       'subject'],
    ['add()',      add      ],
    ['exponent()', exponent ]
])
.describe('#name', (scenario) => {

    it('when given 2 and 2 returns 4', () => {
        expect(scenario.subject(2, 2)).to.equal(4);
    });

});
```