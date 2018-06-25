/**
 * Returns word from under a mouse and wraps it to the Range object.
 * This method receives the CaretPosition object as an argument.
 *
 * @param offsetNode Node which is under a mouse
 * @param offset Offset in node
 * @param x Mouse x coordinate
 * @param y Mouse y coordinate
 * @returns {null|Range}
 */
export function getWordFromCaretPosition ({ offsetNode, offset }, x, y) {
  if (offsetNode.nodeType !== Node.TEXT_NODE) {
    return null;
  }

  let startOffset, endOffset;
  const range = document.createRange();

  // Find the start of the word
  for (
    startOffset = offset;
    startOffset > 0
      && isWordChar(offsetNode.nodeValue[startOffset])
      && isWordChar(offsetNode.nodeValue[startOffset - 1]);
    startOffset--
  ) {}

  // Find the end of the word
  for (endOffset = offset; endOffset < offsetNode.nodeValue.length; endOffset++) {
    if (! isWordChar(offsetNode.nodeValue[endOffset])) {
      break;
    }
  }

  range.setStart(offsetNode, startOffset);
  range.setEnd(offsetNode, endOffset);

  const rect = range.getBoundingClientRect();

  // Check if the cursor is within boundaries of the range.
  if (rect.top < y && rect.bottom > y && rect.left < x && rect.right > x) {
    return range;
  }

  return null;
}

/**
 * Check if the given char can be the part of a word.
 *
 * @return boolean
 */
function isWordChar(char) {
  return /[a-zA-Z-']/.test(char);
}
