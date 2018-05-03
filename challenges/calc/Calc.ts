interface Selector {
  selector: string,
  $el: any
}

interface DOM {
  [id: string]: Selector
}

interface DigitTemplateData {
  digit: string,
  defaultDigit: string
}

class Calculator {

  // ----------
  // Locals
  // ----------

  private digits: string;
  private digitsMax: number;
  private digitTpl: string;
  private defaultDigit: string;
  private dom: DOM;
  private digitRE: RegExp;
  private defDigitRE: RegExp;
  private allowedDigits: RegExp;

  constructor() {
    this.digits = "";
    this.digitsMax = 9;
    this.defaultDigit = "8";
    this.allowedDigits = new RegExp(/[0-9\.]/);
    this.digitRE = new RegExp(/{digit}/);
    this.defDigitRE = new RegExp(/{defaultDigit}/);
    this.digitTpl = `
    <div class="calc__digit">
      <div class="calc__number">{digit}</div>
      <div class="calc__number calc__number--masked">{defaultDigit}</div>
    </div>`;
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
  private setup(): void {
    this.setDOM();
    this.setEvents();
    this.drawDigits();
  }

  /**
   * genDigitTpl();
   * Replaces data placeholders and return resulting string.
   *
   * @private
   * @param {DigitTemplateData} data
   * @returns {string}
   * @memberof Calculator
   */
  private genDigitTpl(data: DigitTemplateData) : string {
    return this.digitTpl
      .replace(this.digitRE, data.digit)
      .replace(this.defDigitRE, data.defaultDigit);
  }

  /**
   * prepareForScreen().
   * Formats the digits for being displayed on screen.
   *
   * @private
   * @param {string} digits
   * @returns {string[]}
   * @memberof Calculator
   */
  private prepareForScren(digits: string): string[] {
    return (this.genEmptyDigits().substring(0, this.digitsMax - digits.length) + digits).split("");
  }

  /**
   * drawDigits().
   * Draws all digits in the digits array.
   *
   * @private
   * @memberof Calculator
   */
  private drawDigits () :void {
    const $screen = this.dom["calcScreen"].$el;
    $screen.innerHTML = "";

    let drawItems: string[] = this.prepareForScren(this.digits);
    if (drawItems.length > this.digitsMax) drawItems = this.prepareForScren("ERROR");

    drawItems.forEach((d) => {
      $screen.innerHTML = $screen.innerHTML + this.genDigitTpl({
        digit: d,
        defaultDigit: this.defaultDigit
      });
    });
  }

  /**
   * $().
   * Returns a DOM element based on the received selector.
   *
   * @private
   * @param {string} selector
   * @returns {*}
   * @memberof Calculator
   */
  private $(selector: string): any {
    return document.querySelector(selector);
  }

  /**
   * $$().
   * Returns all DOM elements based on the received selector.
   *
   * @private
   * @param {string} selector
   * @returns {*}
   * @memberof Calculator
   */
  private $$(selector: string): any {
    return document.querySelectorAll(selector);
  }

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
  private genSelector(selector: string, all: boolean = false): Selector {
    const $el = (all) ? this.$$(selector) : this.$(selector);
    return { selector, $el };
  }

  /**
   * setDOM().
   * Defines a collection of selectors.
   *
   * @private
   * @memberof Calculator
   */
  private setDOM(): void {
    this.dom["keysDetector"] = this.genSelector(".calc");
    this.dom["calcScreen"] = this.genSelector(".calc__screen");
    this.dom["hookPushDigit"] = this.genSelector("[data-hook='pushDigit']", true);
  }

  /**
   * genEmptyDigits().
   * Generates an empty array of digits.
   *
   * @private
   * @returns {*}
   * @memberof Calculator
   */
  private genEmptyDigits(): any {
    const tmpDigits: any = new Array(this.digitsMax);
    tmpDigits.fill(" ");
    return tmpDigits.join("");
  }

  /**
   * clearDigits();
   * This method clears the digits :)
   *
   * @private
   * @returns {*}
   * @memberof Calculator
   */
  private clearDigits(): void {
    this.digits = "";
    this.drawDigits();
  }

  private changeSign(): void {
    if(this.digits.length < this.digitsMax){
      const number: number = (parseFloat(this.digits) * -1);
      this.digits = number.toString();
      this.drawDigits();
    }
  }

  /**
   * keyUp().
   * This method detects the type of key pressed and processes it.
   *
   * @private
   * @param {*} event
   * @memberof Calculator
   */
  private keyUp(event: any) {

    const evtCode = event.code;
    const evtKey = event.key;

    const backSpaceRegExp: RegExp = new RegExp(/Backspace/);
    const digitRegExp: RegExp = new RegExp(/Digit/);
    const periodRegExp: RegExp = new RegExp(/Period/);
    const numpadRegExp: RegExp = new RegExp(/Numpad/);
    const keyCRegExp: RegExp = new RegExp(/KeyC/);
    const shiftRegExp: RegExp = new RegExp(/Shift/);

    console.log(evtCode, evtKey);

    switch (true) {
      case (backSpaceRegExp.test(evtCode)):
        this.popDigit();
        break;
      case (digitRegExp.test(evtCode)):
      case (periodRegExp.test(evtCode)):
      case (numpadRegExp.test(evtCode)):
        this.pushDigit(evtKey);
        break;
      case (keyCRegExp.test(evtCode)):
        this.clearDigits();
        break;
      case (shiftRegExp.test(evtCode)):
        this.changeSign();
        break;
      default:
        break;
    }
  }

  /**
   * isDigitAllowed().
   * Checks to see if a digit is valid to be inserted.
   *
   * @private
   * @param {string} digit
   * @returns
   * @memberof Calculator
   */
  private isDigitAllowed(digit: string): boolean {
    if (!this.allowedDigits.test(digit)) return false;

    const digits: string[] = this.digits.split("");
    if (digit === "." && digits.includes(digit)) return false;

    return true;
  }

  /**
   * pushDigit().
   * Adds a digit to digits array.
   *
   * @private
   * @param {string} digit
   * @returns {void}
   * @memberof Calculator
   */
  private pushDigit(digit: string) : void {
    if(!this.isDigitAllowed(digit)) return;
    // We'll ensure we have a 0 when first digit is a period: "0."
    if(digit === "." && this.digits.length === 0) digit = `0${digit}`;
    if(this.digits.length < this.digitsMax + 1){ // +1 is for being able to show the error legend :p
      this.digits = this.digits.concat(digit);
      this.drawDigits();
    }
  }

  /**
   * popDigit().
   * Removes the last digit.
   *
   * @private
   * @memberof Calculator
   */
  private popDigit(): void {
    const digitsTmp = this.digits.split("");
    digitsTmp.pop();
    this.digits = digitsTmp.join("");
    this.drawDigits();
  }

  /**
   * pushDigitClick().
   * Handles click event from buttons.
   *
   * @private
   * @param {*} event
   * @memberof Calculator
   */
  private pushDigitClick(event: any): void {
    const digit = event.target.dataset.digit.toString();
    this.pushDigit(digit);
  }

  /**
   * setEvents().
   * Set events for the application.
   *
   * @private
   * @memberof Calculator
   */
  private setEvents () :void {
    this.dom["hookPushDigit"].$el.forEach(($el: any) => {
      $el.addEventListener('click', this.pushDigitClick.bind(this));
    });

    document.onkeydown = this.keyUp.bind(this);
  }

}

new Calculator();