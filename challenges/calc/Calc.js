var Calculator = /** @class */ (function () {
    function Calculator() {
        this.digits = "";
        this.digitsMax = 9;
        this.defaultDigit = "8";
        this.allowedDigits = new RegExp(/[0-9\.]/);
        this.digitRE = new RegExp(/{digit}/);
        this.defDigitRE = new RegExp(/{defaultDigit}/);
        this.digitTpl = "\n    <div class=\"calc__digit\">\n      <div class=\"calc__number\">{digit}</div>\n      <div class=\"calc__number calc__number--masked\">{defaultDigit}</div>\n    </div>";
        this.dom = {};
        this.setup();
    }
    // ----------
    // Private
    // ----------
    /**
     * Setup().
     * Application setup :)
     *
     * @private
     * @memberof Calculator
     */
    Calculator.prototype.setup = function () {
        this.setDOM();
        this.setEvents();
        this.drawDigits();
    };
    /**
     * genDigitTpl();
     * Replaces data placeholders and return resulting string.
     *
     * @private
     * @param {DigitTemplateData} data
     * @returns {string}
     * @memberof Calculator
     */
    Calculator.prototype.genDigitTpl = function (data) {
        return this.digitTpl
            .replace(this.digitRE, data.digit)
            .replace(this.defDigitRE, data.defaultDigit);
    };
    /**
     * prepareForScreen().
     * Formats the digits for being displayed on screen.
     *
     * @private
     * @param {string} digits
     * @returns {string[]}
     * @memberof Calculator
     */
    Calculator.prototype.prepareForScren = function (digits) {
        return (this.genEmptyDigits().substring(0, this.digitsMax - digits.length) + digits).split("");
    };
    /**
     * drawDigits().
     * Draws all digits in the digits array.
     *
     * @private
     * @memberof Calculator
     */
    Calculator.prototype.drawDigits = function () {
        var _this = this;
        var $screen = this.dom["calcScreen"].$el;
        $screen.innerHTML = "";
        var drawItems = this.prepareForScren(this.digits);
        if (drawItems.length > this.digitsMax)
            drawItems = this.prepareForScren("ERROR");
        drawItems.forEach(function (d) {
            $screen.innerHTML = $screen.innerHTML + _this.genDigitTpl({
                digit: d,
                defaultDigit: _this.defaultDigit
            });
        });
    };
    /**
     * $().
     * Returns a DOM element based on the received selector.
     *
     * @private
     * @param {string} selector
     * @returns {*}
     * @memberof Calculator
     */
    Calculator.prototype.$ = function (selector) {
        return document.querySelector(selector);
    };
    /**
     * $$().
     * Returns all DOM elements based on the received selector.
     *
     * @private
     * @param {string} selector
     * @returns {*}
     * @memberof Calculator
     */
    Calculator.prototype.$$ = function (selector) {
        return document.querySelectorAll(selector);
    };
    /**
     * genSelector().
     * Receives a string and returns a DOM element.
     *
     * @private
     * @param {string} selector
     * @param {boolean} [all=false]
     * @returns {Selector}
     * @memberof Calculator
     */
    Calculator.prototype.genSelector = function (selector, all) {
        if (all === void 0) { all = false; }
        var $el = (all) ? this.$$(selector) : this.$(selector);
        return { selector: selector, $el: $el };
    };
    /**
     * setDOM().
     * Defines a collection of selectors.
     *
     * @private
     * @memberof Calculator
     */
    Calculator.prototype.setDOM = function () {
        this.dom["keysDetector"] = this.genSelector(".calc");
        this.dom["calcScreen"] = this.genSelector(".calc__screen");
        this.dom["hookPushDigit"] = this.genSelector("[data-hook='pushDigit']", true);
    };
    /**
     * genEmptyDigits().
     * Generates an empty array of digits.
     *
     * @private
     * @returns {*}
     * @memberof Calculator
     */
    Calculator.prototype.genEmptyDigits = function () {
        var tmpDigits = new Array(this.digitsMax);
        tmpDigits.fill(" ");
        return tmpDigits.join("");
    };
    /**
     * keyUp().
     * This method detects the type of key pressed and processes it.
     *
     * @private
     * @param {*} event
     * @memberof Calculator
     */
    Calculator.prototype.keyUp = function (event) {
        var evtCode = event.code;
        var evtKey = event.key;
        var backSpaceRegExp = new RegExp(/Backspace/);
        var digitRegExp = new RegExp(/Digit/);
        var periodRegExp = new RegExp(/Period/);
        var numpadRegExp = new RegExp(/Numpad/);
        console.log(evtCode);
        switch (true) {
            case (backSpaceRegExp.test(evtCode)):
                this.popDigit();
                break;
            case (digitRegExp.test(evtCode)):
            case (periodRegExp.test(evtCode)):
            case (numpadRegExp.test(evtCode)):
                this.pushDigit(evtKey);
            default:
                break;
        }
    };
    /**
     * isDigitAllowrd().
     * Checks to see if a digit is valid to be inserted.
     *
     * @private
     * @param {string} digit
     * @returns
     * @memberof Calculator
     */
    Calculator.prototype.isDigitAllowed = function (digit) {
        return (this.allowedDigits.test(digit));
    };
    /**
     * pushDigit().
     * Adds a digit to digits array.
     *
     * @private
     * @param {string} digit
     * @returns {void}
     * @memberof Calculator
     */
    Calculator.prototype.pushDigit = function (digit) {
        if (!this.isDigitAllowed(digit))
            return;
        if (this.digits.length < this.digitsMax + 1) {
            this.digits = this.digits.concat(digit);
            this.drawDigits();
        }
    };
    /**
     * popDigit().
     * Removes the last digit.
     *
     * @private
     * @memberof Calculator
     */
    Calculator.prototype.popDigit = function () {
        var digitsTmp = this.digits.split("");
        digitsTmp.pop();
        this.digits = digitsTmp.join("");
        this.drawDigits();
    };
    /**
     * pushDigitClick().
     * Handles click event from buttons.
     *
     * @private
     * @param {*} event
     * @memberof Calculator
     */
    Calculator.prototype.pushDigitClick = function (event) {
        var digit = event.target.dataset.digit.toString();
        this.pushDigit(digit);
    };
    /**
     * setEvents().
     * Set events for the application.
     *
     * @private
     * @memberof Calculator
     */
    Calculator.prototype.setEvents = function () {
        var _this = this;
        this.dom["hookPushDigit"].$el.forEach(function ($el) {
            $el.addEventListener('click', _this.pushDigitClick.bind(_this));
        });
        document.onkeydown = this.keyUp.bind(this);
    };
    return Calculator;
}());
new Calculator();
