var safeEval = require('safe-eval');

let a = {}
let context = {
    a: a
}
safeEval("a.b = 2", context);
console.log(a)