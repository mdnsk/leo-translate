import options from '../options';

const elements = document.querySelectorAll('.js-option:not([data-if-checked])');
const dependent = document.querySelectorAll('.js-option[data-if-checked]');

let localOptions = {};

options.getAllOptions().then(ops => {
  localOptions = ops;

  for (let i = 0; i < elements.length; i++) {
    initElement(elements[i]);
  }

  for (let i = 0; i < dependent.length; i++) {
    initElement(dependent[i], ! ops[dependent[i].dataset.ifChecked]);
  }

  function initElement (element, disabled = false) {
    element.disabled = disabled;
    element.checked = ops[element.name];
    element.addEventListener('change', onOptionChange);
  }
});

function onOptionChange (event) {
  const key = event.target.name;
  const val = event.target.checked;

  updateLocalOption(key, val);

  options.setAllOptions(localOptions);
}

function updateLocalOption (key, val) {
  const dependent = document.querySelectorAll('.js-option[data-if-checked="'+key+'"]');

  localOptions[key] = val;

  if (dependent.length > 0) {
    for (let i = 0; i < dependent.length; i++) {
      dependent[i].disabled = !val;
      dependent[i].checked = false;

      updateLocalOption(dependent[i].name, false);
    }
  }
}
