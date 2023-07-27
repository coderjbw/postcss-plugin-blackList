let postcss = require(postcss);
const { expect } = require('chai');
// import pxtorem from '../src/';
const pxtorem = require('../src/');

describe('pxtorem-blackList', function () {
    it('1 加 1 应该等于 2', function () {
        const input = 'h1 { margin: 0 0 20px 20px; font-size: 32px; line-height: 1.2; letter-spacing: 1px; }';
        const output = 'h1 { margin: 0 0 0.2rem 0.2rem; font-size: 0.32rem; line-height: 1.2; letter-spacing: 0.01rem; }';
        const processed = postcss(pxtorem()).process(input).then((result)=>{
            console.log(result.css);
        });

        expect(processed).to.be.equal(output);
    });
});