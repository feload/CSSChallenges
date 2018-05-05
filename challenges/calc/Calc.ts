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
  private operandsStack: string[];
  private isDoingMaths: boolean;

  constructor() {
    this.digits = "";
    this.operandsStack = [];
    this.digitsMax = 9;
    this.isDoingMaths = false;
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
   * outputResultToDOM().
   * Outputs result to DOM :p
   *
   * @private
   * @memberof Calculator
   */
  private outputResultToDOM () : void {
    const $result = this.dom["calcResult"].$el;
    $result.value = this.digits;
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
    if (drawItems.length > this.digitsMax){
       drawItems = this.prepareForScren("ERROR");
       this.digits = "";
    }

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
    this.dom["calcResult"] = this.genSelector(".calc__result");
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

  /**
   * clearMaths().
   * Clear operand stack and flag.
   *
   * @private
   * @memberof Calculator
   */
  private clearMaths() : void {
    this.operandsStack = [];
  }

  /**
   * changeDigitsSign().
   * Changes digits sign.
   *
   * @private
   * @memberof Calculator
   */
  private changeDigitsSign(): void {
    if(this.digits.length < this.digitsMax){
      const number: number = (parseFloat(this.digits) * -1);
      this.digits = number.toString();
      this.drawDigits();
    }
  }

  /**
   * reduceOperands().
   * Reduces the operand stack.
   *
   * @private
   * @param {string} op
   * @returns {number}
   * @memberof Calculator
   */
  private reduceOperands(): number {
    let [a, op, b] = this.operandsStack;
    let operandA = parseFloat(a);
    let operandB = parseFloat(b);

    switch (op) {
      case "+":
        return operandA + operandB;
      case "-":
        return operandA - operandB;
      case "x":
      case "*":
        return operandA * operandB;
      case "%":
      case "/":
        return operandA / operandB;
      default:
        return 0;
    };
  }

  /**
   * doMaths().
   * Does the maths.
   * @TODO: Refactorize.
   *
   * @private
   * @param {string} op
   * @returns {void}
   * @memberof Calculator
   */
  private doMaths(op: string) : void {
    if (!this.digits.length) return;

    let result: string = "";
    if (op == '%') {
      this.operandsStack.push(this.digits, op, '100');
      result = this.reduceOperands().toString();
      this.operandsStack = [];
      this.digits = result;
      this.drawDigits();
    }else{
      if(this.operandsStack.length < 2) {
        if (op != "=") {
          this.operandsStack.push(this.digits, op);
          this.clearDigits();
        }
      } else {
        this.operandsStack.push(this.digits);
        result = this.reduceOperands().toString();
        if(op == "="){
          this.operandsStack = [];
          this.isDoingMaths = false;
        }else{
          this.operandsStack = [result, op];
          this.clearDigits();
        }
        this.digits = result;
        this.drawDigits();
      }
    }

    console.log(this.operandsStack);
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
    const moduleRegExp: RegExp = new RegExp(/%/);
    const periodRegExp: RegExp = new RegExp(/Period/);
    const numpadRegExp: RegExp = new RegExp(/Numpad[0-9]/);
    const numpadAddRegExp: RegExp = new RegExp(/NumpadAdd/);
    const numpadSubtractRegExp: RegExp = new RegExp(/NumpadSubtract/);
    const numpadMultiplyRegExp: RegExp = new RegExp(/NumpadMultiply/);
    const numpadDivideRegExp: RegExp = new RegExp(/NumpadDivide/);
    const enterRegExp: RegExp = new RegExp(/Enter/);
    const deleteRegExp: RegExp = new RegExp(/Delete/);
    const keyCRegExp: RegExp = new RegExp(/KeyC/);
    const keyXRegExp: RegExp = new RegExp(/KeyX/);
    const altRegExp: RegExp = new RegExp(/Alt/);

    console.log(evtCode, evtKey);

    switch (true) {

      case (deleteRegExp.test(evtCode)):
      case (backSpaceRegExp.test(evtCode)):
        this.popDigit();
        break;

      case (numpadSubtractRegExp.test(evtCode)):
      case (numpadAddRegExp.test(evtCode)):
      case (numpadMultiplyRegExp.test(evtCode)):
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
      break
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
    if (digit === "." && digits.indexOf(digit) >= 0) return false;

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