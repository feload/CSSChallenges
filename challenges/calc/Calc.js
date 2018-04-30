var Calculator = /** @class */ (function () {
    function Calculator() {
        this.digits = "";
        this.digitsMax = 9;
        this.defaultDigit = "8";
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
     * @param data: DigitTemplateData;
     */
    Calculator.prototype.genDigitTpl = function (data) {
        return this.digitTpl
            .replace(this.digitRE, data.digit)
            .replace(this.defDigitRE, data.defaultDigit);
    };
    Calculator.prototype.prepareForScren = function (digits) {
        return (this.genEmptyDigits().substring(0, this.digitsMax - digits.length) + digits).split("");
    };
    /**
     * drawDigits().
     * Draws all digits in the digits array.
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
     * @param selector: string;
     */
    Calculator.prototype.$ = function (selector) {
        return document.querySelector(selector);
    };
    /**
     * $$().
     * Returns all DOM elements based on the received selector.
     *
     * @param selector: string;
     */
    Calculator.prototype.$$ = function (selector) {
        return document.querySelectorAll(selector);
    };
    /**
     * genSelector().
     * Receives a string and returns a DOM element.
     *
     * @param selector: string
     */
    Calculator.prototype.genSelector = function (selector, all) {
        if (all === void 0) { all = false; }
        var $el = (all) ? this.$$(selector) : this.$(selector);
        return { selector: selector, $el: $el };
    };
    /**
     * setDOM().
     * Defines a collection of selectors.
     */
    Calculator.prototype.setDOM = function () {
        this.dom["keysDetector"] = this.genSelector(".calc");
        this.dom["calcScreen"] = this.genSelector(".calc__screen");
        this.dom["hookPushDigit"] = this.genSelector("[data-hook='pushDigit']", true);
    };
    /**
     * genEmptyDigits().
     * Generates an empty array of digits.
     */
    Calculator.prototype.genEmptyDigits = function () {
        var tmpDigits = new Array(this.digitsMax);
        tmpDigits.fill(" ");
        return tmpDigits.join("");
    };
    Calculator.prototype.keyUp = function (event) {
        console.log(event);
    };
    /**
     * pushDitit().
     * Adds a digit to digits array.
     *
     * @param event: any;
     */
    Calculator.prototype.pushDigit = function (event) {
        this.digits = this.digits.concat(event.target.dataset.digit.toString());
        this.drawDigits();
    };
    /**
     * setEvents().
     * Set events for the application.
     */
    Calculator.prototype.setEvents = function () {
        var _this = this;
        this.dom["hookPushDigit"].$el.forEach(function ($el) {
            $el.addEventListener('click', _this.pushDigit.bind(_this));
        });
        document.onkeydown = this.keyUp.bind(this);
    };
    return Calculator;
}());
new Calculator();
