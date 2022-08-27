# validator-object
Validate objects with a schema object.

## Basic Example
```js
var { validateObject } = require('validate-object')

var obj = {
  name: "Ben",
  age: 30,
  born: 1990
}

var schema = {
  keys: {
    name: "String",  // uses libs own provided built in test function
    age: Number      // uses instanceof check
  }
}

console.log(validateObject(obj, schema)) // -> true
```


<!-- ## Full Example
```js
var { validateObject } = require('validate-object')

var obj = {
  name: "Ben",
  age: 30,
  bd: new Date(),
  child: {
    name: "Ann",
    age: 12
  }
}

var schema = {
  keys: {
    name: "string",
    age: {
      type: "number",
      value: 40
    },
    bd: {
      type: Date,
      validator: (val) => val.getDay() === 5 || val.getDay() === 6,
      meta: { enumerable: false }
    },
    child: {
      exactKeys: true,
      keys: ["name", "age"],
      proto: true
    }
  },
  proto: "default",
  meta: "extensible"
}


var config =  {
  validateNestedObjects: true,
  exactKeys: false,
  recursionLimit: Infinity,
  useLooseValueCompare: false,
  countBoxedPrimAsPrimValue: false,     // treats objects created via: new String/Object/new Object, as primitive values
  validateObjectByConstructor: false,   // chain vs not.
  strictTagCheck: false                 
}

// setOptions()

console.log(validateObject(obj, schema, config)) // -> true
``` -->

<!-- check for the type of built-in or custom (own) objects can be done with key: String|. This will use instanceof unless X set, which will use constructor instead.  -->

<!-- # A note on security
Remmeber that almost all typechecking in JS can be manipulated, as the rely on external/js exposed data,
or indirect that can also be manipulated.
 <!-- typeof safe?  -->
