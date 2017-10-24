import options from '../options';

const elements = document.querySelectorAll('.js-option:not([data-if-checked])');
const dependent = document.querySelectorAll('.js-option[data-if-checked]');

options.getAllOptions().then(ops => {
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

  options.setOption(key, val).then(() => {
    const dependent = document.querySelectorAll('.js-option[data-if-checked="'+key+'"]');

    if (dependent.length > 0) {
      const event = new Event('change');

      for (let i = 0; i < dependent.length; i++) {
        if (val) {
          dependent[i].disabled = false;
        } else {
          dependent[i].checked = false;
          dependent[i].dispatchEvent(event);
          dependent[i].disabled = true;
        }
      }
    }
  });
}
