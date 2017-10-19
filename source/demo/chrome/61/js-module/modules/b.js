/**
 * @file native js module named `b`
 * @author mj(zoumiaojiang@gmail.com)
 */

import moduleA from './a.js';

export default {
    methodA() {
        console.log('method a of module B');
        moduleA.methodA();
    },

    methodB() {
        console.log('method b of module B');
    }
};
