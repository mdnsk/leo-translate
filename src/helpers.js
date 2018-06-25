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

export function extractHostname (url) {
  let hostname;

  //find & remove protocol (http, ftp, etc.) and get hostname
  if (url.indexOf("://") > -1) {
    hostname = url.split('/')[2];
  }
  else {
    hostname = url.split('/')[0];
  }

  //find & remove port number
  hostname = hostname.split(':')[0];

  //find & remove "?"
  hostname = hostname.split('?')[0];

  return hostname;
}
