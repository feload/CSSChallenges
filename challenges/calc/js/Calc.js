// ----------
//  Interfaces.
//  @TODOS: Disable alt key when no digits.
//          Remove all digits when last digit is a negative number.
//          Add effects when button clicked or key pressed.
//          Add comment signature.
//          Add reference to source code.
//          These interfaces should be placed in their own file...
//          Add unit/e2e tests.
//          Refactor.
// ----------
var Calculator = /** @class */ (function () {
    function Calculator() {
        this.digits = "";
        this.operandsStack = [];
        this.digitsMax = 9;
        this.isDoingMaths = false;
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
     * @param {IDigitTemplateData} data
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
     * outputResultToDOM().
     * Outputs result to DOM :p
     *
     * @private
     * @memberof Calculator
     */
    Calculator.prototype.outputResultToDOM = function () {
        var $result = this.dom["calcResult"].$el;
        $result.value = this.digits;
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
        if (drawItems.length > this.digitsMax) {
            drawItems = this.prepareForScren("ERROR");
            this.digits = "";
        }
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
        this.dom["calcResult"] = this.genSelector(".calc__result");
        this.dom["hookPushDigit"] = this.genSelector("[data-hook='pushDigit']", true);
        this.dom["hookDoMaths"] = this.genSelector("[data-hook='doMaths']", true);
        this.dom["hookDoSpecial"] = this.genSelector("[data-hook='doSpecial']", true);
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
     * clearDigits();
     * This method clears the digits :)
     *
     * @private
     * @returns {*}
     * @memberof Calculator
     */
    Calculator.prototype.clearDigits = function () {
        this.digits = "";
        this.drawDigits();
    };
    /**
     * clearMaths().
     * Clear operand stack and flag.
     *
     * @private
     * @memberof Calculator
     */
    Calculator.prototype.clearMaths = function () {
        this.operandsStack = [];
    };
    /**
     * changeDigitsSign().
     * Changes digits sign.
     *
     * @private
     * @memberof Calculator
     */
    Calculator.prototype.changeDigitsSign = function () {
        if (this.digits.length < this.digitsMax) {
            var number = (parseFloat(this.digits) * -1);
            this.digits = number.toString();
            this.drawDigits();
        }
    };
    /**
     * reduceOperands().
     * Reduces the operand stack.
     *
     * @private
     * @param {string} op
     * @returns {number}
     * @memberof Calculator
     */
    Calculator.prototype.reduceOperands = function () {
        var _a = this.operandsStack, a = _a[0], op = _a[1], b = _a[2];
        var operandA = parseFloat(a);
        var operandB = parseFloat(b);
        var result = 0;
        switch (op) {
            case "+":
                result = operandA + operandB;
            case "-":
                result = operandA - operandB;
            case "x":
            case "*":
                result = operandA * operandB;
            case "%":
            case "/":
                result = operandA / operandB;
                break;
        }
        ;
        return parseFloat(result.toFixed(2));
    };
    /**
     * doMaths().
     * Does the maths.
     *
     * @private
     * @param {string} op
     * @returns {void}
     * @memberof Calculator
     */
    Calculator.prototype.doMaths = function (op) {
        if (!this.digits.length)
            return;
        var result = "";
        if (op == '%') {
            this.operandsStack.push(this.digits, op, '100');
            result = this.reduceOperands().toString();
            this.operandsStack = [];
            this.digits = result;
            this.drawDigits();
        }
        else {
            if (this.operandsStack.length < 2) {
                if (op != "=") {
                    this.operandsStack.push(this.digits, op);
                    this.clearDigits();
                }
            }
            else {
                this.operandsStack.push(this.digits);
                result = this.reduceOperands().toString();
                if (op == "=") {
                    this.operandsStack = [];
                    this.isDoingMaths = false;
                }
                else {
                    this.operandsStack = [result, op];
                    this.clearDigits();
                }
                this.digits = result;
                this.drawDigits();
            }
        }
    };
    /**
     * engine().
     * This method detects the type of key pressed and processes it.
     *
     * @private
     * @param {*} event
     * @memberof Calculator
     */
    Calculator.prototype.engine = function (event) {
        var evtCode = event.code;
        var evtKey = event.key;
        var backSpaceRegExp = new RegExp(/Backspace/);
        var digitRegExp = new RegExp(/Digit/);
        var moduleRegExp = new RegExp(/%/);
        var periodRegExp = new RegExp(/Period/);
        var numpadRegExp = new RegExp(/Numpad[0-9\.]/);
        var numpadAddRegExp = new RegExp(/NumpadAdd/);
        var numpadSubtractRegExp = new RegExp(/NumpadSubtract/);
        var numpadMultiplyRegExp = new RegExp(/NumpadMultiply/);
        var numpadDivideRegExp = new RegExp(/NumpadDivide/);
        var numpadOpRegExp = new RegExp(/NumpadOp/);
        var enterRegExp = new RegExp(/Enter/);
        var deleteRegExp = new RegExp(/Delete/);
        var keyCRegExp = new RegExp(/KeyC/);
        var keyXRegExp = new RegExp(/KeyX/);
        var altRegExp = new RegExp(/Alt/);
        switch (true) {
            case (deleteRegExp.test(evtCode)):
            case (backSpaceRegExp.test(evtCode)):
                this.popDigit();
                break;
            case (numpadSubtractRegExp.test(evtCode)):
            case (numpadAddRegExp.test(evtCode)):
            case (numpadMultiplyRegExp.test(evtCode)):
            case (numpadOpRegExp.test(evtCode)):
            case (numpadDivideRegExp.test(evtCode)):
            case (moduleRegExp.test(evtKey)):
                this.isDoingMaths = true;
                this.doMaths(evtKey);
                this.outputResultToDOM();
                break;
            case (digitRegExp.test(evtCode)):
            case (periodRegExp.test(evtCode)):
            case (numpadRegExp.test(evtCode)):
                if (this.operandsStack.length == 2 && this.isDoingMaths == true) {
                    this.isDoingMaths = false;
                    this.clearDigits();
                }
                this.pushDigit(evtKey);
                break;
            case (keyCRegExp.test(evtCode)):
                this.clearDigits();
                this.clearMaths();
                break;
            case (altRegExp.test(evtCode)):
                this.changeDigitsSign();
                break;
            case (enterRegExp.test(evtCode)):
                this.doMaths("=");
                break;
        }
    };
    /**
     * isDigitAllowed().
     * Checks to see if a digit is valid to be inserted.
     *
     * @private
     * @param {string} digit
     * @returns
     * @memberof Calculator
     */
    Calculator.prototype.isDigitAllowed = function (digit) {
        if (!this.allowedDigits.test(digit))
            return false;
        var digits = this.digits.split("");
        if (digit === "." && digits.indexOf(digit) >= 0)
            return false;
        return true;
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
        // We'll ensure we have a 0 when first digit is a period: "0."
        if (digit === "." && this.digits.length === 0)
            digit = "0" + digit;
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
        this.engine({ code: "Numpad" + digit, key: digit });
    };
    /**
     * doMathsClick().
     * Handles click event from buttons.
     *
     * @private
     * @param {*} event
     * @memberof Calculator
     */
    Calculator.prototype.doMathsClick = function (event) {
        var op = event.target.dataset.op.toString();
        this.engine({ code: "NumpadOp", key: op });
    };
    /**
     * doSpecialClick().
     * Handles click from special buttons.
     *
     * @private
     * @param {*} event
     * @memberof Calculator
     */
    Calculator.prototype.doSpecialClick = function (event) {
        var op = event.target.dataset.op.toString();
        this.engine({ code: op, key: '' });
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
        this.dom["hookDoMaths"].$el.forEach(function ($el) {
            $el.addEventListener('click', _this.doMathsClick.bind(_this));
        });
        this.dom["hookDoSpecial"].$el.forEach(function ($el) {
            $el.addEventListener('click', _this.doSpecialClick.bind(_this));
        });
        document.onkeydown = this.engine.bind(this);
    };
    return Calculator;
}());
new Calculator();
