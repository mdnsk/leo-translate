export function removeHtmlTags (text) {
  return text.replace(/[<>]/g, '');
}

export function getBodyOffset () {
  // Do not return offset if the body element doesn't have any position.
  if (document.body.style.position === 'static' ||
      document.body.style.position === '') {
    return { top: 0, left: 0 };
  }

  const rectBody = document.body.getBoundingClientRect();
  const rectDocument = document.documentElement.getBoundingClientRect();

  return {
    top: rectDocument.top - rectBody.top,
    left: rectDocument.left - rectBody.left
  };
}
