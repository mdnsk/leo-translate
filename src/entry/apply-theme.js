import options from '../options';

const theme = options.getOption('theme', 'leo-translate').then(themeName => {
  document.getElementsByTagName('html')[0].classList.add('theme-'+themeName);
});
