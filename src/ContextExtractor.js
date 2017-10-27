export class Context {

  /**
   * Init all the class properties.
   * @param selection The selected text
   * @param behind    The text behind the selection
   * @param ahead     The text ahead the selection
   */
  constructor (selection, behind, ahead) {
    this.selection = selection;
    this.behind = behind;
    this.ahead = ahead;
  }

  /**
   * Get the sentence closest to the selection.
   * @returns {string}
   */
  getSentence () {
    let offset = 0;
    let context = '';
    const allSentences = this.allSentences;

    for (let i = 0; i < allSentences.length; i++) {
      context = allSentences[i];
      offset += context.length;

      if (offset > this.behind.length) {
        break;
      }
    }

    return context;
  }

  get joinedContext () {
    return this.behind+this.selection+this.ahead;
  }

  get allSentences () {
    return this.joinedContext
      .replace(/(.*?(?:\.|!|\?)(?:(?= +[A-Z0-9])|$))/g, '$1'+Context.DELIMITER)
      .split(Context.DELIMITER);
  }

  /**
   * Returns the delimiter which is used in regex splitting.
   * @returns {string}
   */
  static get DELIMITER () {
    return '|leo-translate-delimiter|';
  }
}

export default class Extractor {

  /**
   * Init all the class properties.
   */
  constructor (selection) {
    this.selection = selection;
    this.range = this.selection.rangeCount < 1 ? null : this.selection.getRangeAt(0);
  }

  /**
   * Returns the context sentence that contains the selected text.
   * @returns {*}
   */
  getContext () {
    if (this.range === null) {
      return null;
    }

    const rngContent = this.range.toString();
    const rngLength = rngContent.length;
    const remains = Extractor.LIMIT - rngLength;

    let selection = '';
    let behind = '';
    let ahead = '';

    if (rngLength >= Extractor.LIMIT) {
      selection = rngContent.substr(0, Extractor.LIMIT);
    } else {
      selection = rngContent;
      if (this.range.startContainer.nodeType === Node.TEXT_NODE) {
        if (this.range.startOffset - remains >= 0) {
          behind = this.range.startContainer.textContent.substr(this.range.startOffset - remains, remains);
        } else {
          behind = this.gatherText(this.range.startContainer, this.range.startContainer.textContent.substr(0, this.range.startOffset), Extractor.BACKWARD_DIRECTION, true);
        }
      } else if (this.range.endContainer.nodeType === Node.ELEMENT_NODE) {
        behind = this.gatherText(this.range.startContainer.childNodes[this.range.startOffset], '', Extractor.BACKWARD_DIRECTION, true);
      }

      if (this.range.endContainer.nodeType === Node.TEXT_NODE) {
        if (this.range.endOffset + remains <= this.range.endContainer.textContent.length - 1) {
          ahead = this.range.endContainer.textContent.substr(this.range.endOffset, remains);
        } else {
          ahead = this.gatherText(this.range.endContainer, this.range.endContainer.textContent.substr(this.range.endOffset), Extractor.FORWARD_DIRECTION, true);
        }
      } else if (this.range.endContainer.nodeType === Node.ELEMENT_NODE) {
        ahead = this.gatherText(this.range.endContainer.childNodes[this.range.endOffset], '', Extractor.FORWARD_DIRECTION, true);
      }
    }

    return new Context(selection, behind, ahead);
  }

  gatherText (el, text, direction, skip = false) {
    const getStartChildNode = element => {
      if (element.childNodes.length > 0) {
        return element.childNodes[direction === Extractor.BACKWARD_DIRECTION ? element.childNodes.length - 1 : 0];
      }

      return null;
    };

    const getSiblingElement = element => {
      return direction === Extractor.BACKWARD_DIRECTION ? element.previousSibling : element.nextSibling;
    }

    if ([Extractor.BACKWARD_DIRECTION, Extractor.FORWARD_DIRECTION].indexOf(direction) === -1) {
      throw new Error('Invalid direction "'+direction+'"');
    }

    if (Extractor.isBlock(el) || el.nodeName.toLowerCase() === 'br') {
      return '';
    }

    const remains = Extractor.LIMIT - text.length;

    if (remains < 1) {
      throw new Error('The text is longer than LIMIT');
    }

    // extract text from the current element
    if (! skip && el.nodeType === Node.TEXT_NODE) {
      const content = el.textContent;

      if (direction === Extractor.BACKWARD_DIRECTION) {
        text = content.substr(remains * -1, remains) + text;
      } else if (direction === Extractor.FORWARD_DIRECTION) {
        text += content.substr(0, remains);
      }
    }

    if (text.length >= Extractor.LIMIT) {
      return text;
    }

    let nextElement;

    // go to the child or sibling element
    if ((nextElement = getStartChildNode(el)) !== null || (nextElement = getSiblingElement(el)) !== null) {
      if (Extractor.isBlock(nextElement) || nextElement.nodeName.toLowerCase() === 'br') {
        return text;
      }

      return this.gatherText(nextElement, text, direction);
    }

    // go to a parent element if current element is not block
    else {
      let parent = el.parentNode;

      while (parent !== null) {
        if (Extractor.isBlock(parent) || parent.nodeName.toLowerCase() === 'body') {
          break;
        }

        nextElement = getSiblingElement(parent);

        if (nextElement !== null) {
          if (Extractor.isBlock(nextElement)) {
            break;
          }

          return this.gatherText(nextElement, text, direction);
        }

        parent = parent.parentNode;
      }
    }

    // there is no text anymore
    return text;
  }

  static isBlock (el) {
    if (el.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }

    const inlineCssValues = ['inline', 'inline-block'];
    const display = window.getComputedStyle(el).getPropertyValue('display');

    return inlineCssValues.indexOf(display) === -1;
  }

  /**
   * Returns the LIMIT of the sentence.
   * @returns {number}
   */
  static get LIMIT () {
    return 128;
  }

  static get FORWARD_DIRECTION () {
    return 'forward';
  }

  static get BACKWARD_DIRECTION () {
    return 'backward';
  }
}
