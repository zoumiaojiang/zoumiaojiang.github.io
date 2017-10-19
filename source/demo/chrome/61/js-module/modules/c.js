/**
 * @file native js module named `c`
 * @author mj(zoumiaojiang@gmail.com)
 */

import moduleA from './a.js';
import moduleB from './b.js';

console.log('this is module C');

moduleA.methodA();
moduleB.methodB();
