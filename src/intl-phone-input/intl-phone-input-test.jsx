/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* eslint import/no-extraneous-dependencies: [2, {"devDependencies": true}] */

import bowser from 'bowser';
import { render, cleanUp, simulate } from '../test-utils';

import IntlPhoneInput from './intl-phone-input';
import { SCROLL_TO_CORRECTION } from '../vars';

const SIZES = ['s', 'm', 'l', 'xl'];

describe('intl-phone-input', () => {
    let originalWindowScrollTo = window.scrollTo;

    beforeEach(() => {
        window.scrollTo = sinon.spy();
    });

    afterEach(() => {
        cleanUp();
        window.scrollTo = originalWindowScrollTo;
    });

    it('renders without problems', () => {
        let intlPhoneInput = render(<IntlPhoneInput />);
        expect(intlPhoneInput.node).to.have.exist;
    });

    it('renders without problems in all sizes', () => {
        SIZES.forEach((size) => {
            let intlPhoneInput = render(<IntlPhoneInput size={ size } />);
            expect(intlPhoneInput.node).to.have.exist;
        });
    });

    it('should return `HTMLInputElement` when `getControl` method called', () => {
        let elem = render(<IntlPhoneInput />);
        let controlNode = elem.instance.getControl();

        expect(controlNode).to.be.instanceOf(HTMLInputElement);
    });

    it('should call `onFocus` callback on public `focus` method call', (done) => {
        let onFocus = sinon.spy();
        let elem = render(<IntlPhoneInput onFocus={ onFocus } />);

        elem.instance.focus();

        setTimeout(() => {
            expect(onFocus).to.have.been.calledOnce;
            done();
        }, 0);
    });

    it('should call `onBlur` on public `blur` method call', (done) => {
        let onBlur = sinon.spy();
        let elem = render(<IntlPhoneInput onBlur={ onBlur } />);

        elem.instance.focus();

        setTimeout(() => {
            elem.instance.blur();
            expect(onBlur).to.have.been.calledOnce;
            done();
        }, 0);
    });

    it('should scroll window to element on public `scrollTo` method', (done) => {
        let elem = render(<IntlPhoneInput />);
        let elemTopPosition = elem.instance.input.getNode().getBoundingClientRect().top;
        let elemScrollTo = (elemTopPosition + window.pageYOffset) - SCROLL_TO_CORRECTION;

        elem.instance.scrollTo();

        setTimeout(() => {
            expect(window.scrollTo).to.have.been.calledWith(0, elemScrollTo);
            done();
        }, 0);
    });

    it('should call `onChange` callback after input was changed with dial code of country without priority', () => {
        let onChange = sinon.spy();
        let elem = render(<IntlPhoneInput onChange={ onChange } />);
        let controlNode = elem.instance.getControl();

        simulate(controlNode, 'change', { target: { value: '+54' } });

        expect(onChange).to.have.been.calledOnce;
        expect(onChange).to.have.been.calledWith('+54');
    });

    it('should call `onChange` callback after input was changed with dial code of country from NANP', () => {
        let onChange = sinon.spy();
        let elem = render(<IntlPhoneInput onChange={ onChange } />);
        let controlNode = elem.instance.getControl();

        simulate(controlNode, 'change', { target: { value: '+1868' } });

        expect(onChange).to.have.been.calledOnce;
        expect(onChange).to.have.been.calledWith('+1868');
    });

    it('should call `onChange` callback after input was changed with whole russian number', () => {
        let onChange = sinon.spy();
        let elem = render(<IntlPhoneInput onChange={ onChange } />);
        let controlNode = elem.instance.getControl();

        simulate(controlNode, 'change', { target: { value: '+74957888878' } });

        expect(onChange).to.have.been.calledOnce;
        expect(onChange).to.have.been.calledWith('+74957888878');
    });

    it('should have default country flag icon', () => {
        let elem = render(<IntlPhoneInput />);

        expect(elem.node.querySelector('.flag-icon')).to.have.class('flag-icon_country_ru');
    });

    it('should set new country flag icon from props', () => {
        let elem = render(<IntlPhoneInput value='+61' />);

        expect(elem.node.querySelector('.flag-icon')).to.have.class('flag-icon_country_au');
    });

    describe('handleSelectFocus method', () => {
        const elem = render(<IntlPhoneInput />).instance;

        beforeEach(() => {
            elem.loadUtil = sinon.spy();
            elem.resolveFocusedState = () => {};
        });

        it('should call `loadUtil` method if state.onceOpened is falsy', () => {
            elem.setState({ onceOpened: false });
            elem.handleSelectFocus();
            expect(elem.loadUtil).to.have.callCount(1);
        });

        it('shouldn`t call `loadUtil` method if state.onceOpened is truly', () => {
            elem.setState({ onceOpened: true });
            elem.handleSelectFocus();
            expect(elem.loadUtil).to.have.callCount(0);
        });
    });

    describe('getOptions method', () => {
        const elem = render(<IntlPhoneInput />).instance;

        it('should return array with zero length if state.onceOpened is falsy', () => {
            elem.setState({ onceOpened: false });
            expect(elem.getOptions(() => {}).length).to.equal(0);
        });

        it('should return array with countries length if state.onceOpened is truly', () => {
            elem.setState({ onceOpened: true });
            expect(elem.getOptions(() => {}).length).to.equal(243);
        });
    });

    if (!bowser.mobile) {
        it('should call `onChange` callback after select was changed', () => {
            let onChange = sinon.spy();

            render(<IntlPhoneInput onChange={ onChange } />).instance.setState({ onceOpened: true });

            let popupNode = document.querySelector('.popup');
            let firstOptionNode = popupNode.querySelector('.menu-item');

            firstOptionNode.click();

            expect(onChange).to.have.been.calledOnce;
        });

        it('should focus on input after select was changed', (done) => {
            let elem = render(<IntlPhoneInput />);
            elem.instance.setState({ onceOpened: true });
            let controlNode = elem.instance.getControl();
            let popupNode = document.querySelector('.popup');
            let firstOptionNode = popupNode.querySelector('.menu-item');

            firstOptionNode.click();

            setTimeout(() => {
                expect(document.activeElement.isEqualNode(controlNode)).to.be.true;

                done();
            }, 0);
        });

        it('should focus on input after select was closed by button toggle', (done) => {
            let elem = render(<IntlPhoneInput />);
            let selectButtonNode = elem.node.querySelector('.select-button');
            let controlNode = elem.instance.getControl();

            selectButtonNode.click();

            setTimeout(() => {
                selectButtonNode.click();

                setTimeout(() => {
                    expect(document.activeElement.isEqualNode(controlNode)).to.be.true;

                    done();
                }, 0);
            }, 0);
        });
    }
});
