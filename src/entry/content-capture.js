import optionsStorage from '../options';
// import ContextExtractor from '../ContextExtractor';

let options = {};

// Fetch options from local storage
optionsStorage.getAllOptions().then(data => options = data);

document.body.addEventListener('mousedown', e => {
  if (e.button === 0) {
    closePopup();
  }
});

document.body.addEventListener('dblclick', e => {
  if (options['double-click']) {
    // If there's a key constraint.
    if (options['double-click-ctrl'] || options['double-click-alt']) {

      // If there are no conditions that have passed a check.
      if (! (isAltClick(e) || isCtrlClick(e))) {
        return;
      }
    }

    openPopup();
  }
});

function closePopup () {
  console.log('close popup');
}

function openPopup () {
  console.log('open popup');
  const selection = window.getSelection();

  if (selection.rangeCount > 0) {
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    console.log(rect);
  }
}

function isAltClick (e) {
  return options['double-click-alt'] && e.altKey;
}

function isCtrlClick (e) {
  return options['double-click-ctrl'] && e.ctrlKey;
}
