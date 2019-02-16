import options from '../storage/options';

options.getOption('theme').then(themeName => {
  document.querySelector('html').classList.add(`theme-${themeName}`);
});
