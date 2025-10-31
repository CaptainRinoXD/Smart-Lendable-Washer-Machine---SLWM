In JavaScript modules (ES Modules), there are two primary ways to export values from a file: **named exports** and **default exports**. They serve similar purposes but have distinct syntaxes and implications for how they are imported.

### 1. Named Exports

**Definition:** You can export multiple values (variables, functions, classes, etc.) from a single module by explicitly naming them.

**Characteristics:**
*   **Multiple Exports:** A module can have many named exports.
*   **Specific Names:** When importing, you must use the exact name that was exported.
*   **Destructuring:** They are imported using destructuring syntax (`{}`).

**Example:**

`myModule.js`
```javascript myModule.js
export const myVariable = 10;

export function myFunction() {
  console.log('Hello from myFunction');
}

export class MyClass {
  constructor() {
    this.name = 'MyClass';
  }
}

// You can also group them at the end:
const anotherVar = 'abc';
function anotherFn() { /* ... */ }
export { anotherVar, anotherFn };
```

`main.js` (Importing `myModule.js`)
```javascript main.js
import { myVariable, myFunction, MyClass } from './myModule.js';
// Or, if you used the grouped export:
// import { myVariable, myFunction, MyClass, anotherVar, anotherFn } from './myModule.js';


console.log(myVariable); // 10
myFunction(); // Hello from myFunction
const instance = new MyClass();
console.log(instance.name); // MyClass
```

**Renaming on Import:** You can rename a named import using `as`:
```javascript main.js
import { myVariable as num, myFunction as func } from './myModule.js';

console.log(num); // 10
func(); // Hello from myFunction
```

### 2. Default Exports

**Definition:** A module can have only one default export. This is often used for the primary entity that the module is intended to provide.

**Characteristics:**
*   **Single Export:** A module can have *only one* default export.
*   **Flexible Naming:** When importing, you can give the default export *any name you like*.
*   **No Destructuring:** It's imported directly, without curly braces.

**Example:**

`myOtherModule.js`
```javascript myOtherModule.js
const myDefaultValue = {
  name: 'Default Object',
  version: '1.0'
};

export default myDefaultValue; // Only one default export allowed per module
```
Or, you can export directly:
```javascript myOtherModule.js
export default function sayHello() {
  console.log('Hello from default export');
}
```

`main.js` (Importing `myOtherModule.js`)
```javascript main.js
import someValue from './myOtherModule.js'; // 'someValue' can be any name you choose

console.log(someValue); // { name: 'Default Object', version: '1.0' }
```
If the default export was the `sayHello` function:
```javascript main.js
import greetingFunction from './myOtherModule.js'; // Renamed to 'greetingFunction'

greetingFunction(); // Hello from default export
```

### When to Use Which?

*   **Use Default Exports when:**
    *   The module exports *only one* main thing. This is common for components (e.g., a React component), utilities that provide a single function, or objects that represent a single entity.
    *   You want to allow the importer to choose the name for the import.
    *   Example: `export default class User { ... }`, `export default router;` (for an Express router).

*   **Use Named Exports when:**
    *   The module exports *multiple* distinct values.
    *   You want to ensure that imports use the exact names defined in the module for clarity and to avoid naming collisions.
    *   Example: `export const PI = 3.14; export function calculateArea(radius) { ... }`.

### Can they be combined?

Yes, a module can have one default export and multiple named exports.

**Example:**

`combinedExports.js`
```javascript combinedExports.js
export const namedVar = 'I am a named export';

export default function defaultFunc() {
  console.log('I am the default export function');
}
```

`main.js`
```javascript main.js
import defaultFunc, { namedVar } from './combinedExports.js';

console.log(namedVar); // I am a named export
defaultFunc(); // I am the default export function
```