import postcss from 'postcss';
import {expect} from 'chai';
import pxtorem from '../src/index.js';

const basicCSS = '.rule { font-size: 15px }';

describe('pxtorem-blackList', function () {
    it('should work on the readme example', function () {
        const input =
            'h1 { margin: 0 0 20px 20px; font-size: 32px; line-height: 1.2; letter-spacing: 1px; }';
        const output =
            'h1 { margin: 0 0 0.2rem 0.2rem; font-size: 0.32rem; line-height: 1.2; letter-spacing: 0.01rem; }';
        const processed = postcss(pxtorem()).process(input).css;
        console.log(postcss(pxtorem()).process(input));

        expect(processed).to.be.equal(output);
    });

    it('should replace the px unit with rem', () => {
        const processed = postcss(pxtorem()).process(basicCSS).css;
        const expected = '.rule { font-size: 0.15rem }';

        expect(processed).to.be.equal(expected);
    });
});
