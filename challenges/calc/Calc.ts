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

  constructor() {
    this.digits = "";
    this.digitsMax = 9;
    this.defaultDigit = "8";
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
   * @param data: DigitTemplateData;
   */
  private genDigitTpl(data: DigitTemplateData) : string {
    return this.digitTpl
      .replace(this.digitRE, data.digit)
      .replace(this.defDigitRE, data.defaultDigit);
  }

  private prepareForScren(digits: string): string[] {
    return (this.genEmptyDigits().substring(0, this.digitsMax - digits.length) + digits).split("");
  }

  /**
   * drawDigits().
   * Draws all digits in the digits array.
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
   * @param selector: string;
   */
  private $(selector: string): any {
    return document.querySelector(selector);
  }

  /**
   * $$().
   * Returns all DOM elements based on the received selector.
   *
   * @param selector: string;
   */
  private $$(selector: string): any {
    return document.querySelectorAll(selector);
  }

  /**
   * genSelector().
   * Receives a string and returns a DOM element.
   *
   * @param selector: string
   */
  private genSelector(selector: string, all: boolean = false): Selector {
    const $el = (all) ? this.$$(selector) : this.$(selector);
    return { selector, $el };
  }

  /**
   * setDOM().
   * Defines a collection of selectors.
   */
  private setDOM(): void {
    this.dom["keysDetector"] = this.genSelector(".calc");
    this.dom["calcScreen"] = this.genSelector(".calc__screen");
    this.dom["hookPushDigit"] = this.genSelector("[data-hook='pushDigit']", true);
  }

  /**
   * genEmptyDigits().
   * Generates an empty array of digits.
   */
  private genEmptyDigits(): any {
    const tmpDigits: any = new Array(this.digitsMax);
    tmpDigits.fill(" ");

    return tmpDigits.join("");
  }

  private keyUp(event: any) {
    console.log(event);
  }

  /**
   * pushDitit().
   * Adds a digit to digits array.
   *
   * @param event: any;
   */
  private pushDigit(event: any) : void {
    this.digits = this.digits.concat(event.target.dataset.digit.toString());
    this.drawDigits();
  }

  /**
   * setEvents().
   * Set events for the application.
   */
  private setEvents () :void {
    this.dom["hookPushDigit"].$el.forEach(($el: any) => {
      $el.addEventListener('click', this.pushDigit.bind(this));
    });

    document.onkeydown = this.keyUp.bind(this);
  }

}

new Calculator();