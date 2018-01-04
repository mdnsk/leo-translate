export function removeHtmlTags (text) {
  return text.replace(/[<>]/g, '');
}

export function getBodyOffset () {
  const rectBody = document.body.getBoundingClientRect();
  const rectDocument = document.documentElement.getBoundingClientRect();

  return {
    top: rectDocument.top - rectBody.top,
    left: rectDocument.left - rectBody.left
  };
}
