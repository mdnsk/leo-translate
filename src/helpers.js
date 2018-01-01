export function removeHtmlTags (text) {
  return text.replace(/[<>]/g, '');
}

export default {
  removeHtmlTags
};
