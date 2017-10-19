import options from '../options';

const elements = document.querySelectorAll('.js-option');

options.getAllOptions().then(options => {
  for (let i = 0; i < elements.length; i++) {
    elements[i].disabled = false;
    elements[i].checked = options[elements[i].name];
    elements[i].addEventListener('change', onOptionChange);
  }
});

function onOptionChange (event) {
  const key = event.target.name;
  const val = event.target.checked;

  options.setOption(key, val);
}
