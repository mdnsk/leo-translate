# LeoTranslate

Расширение для Firefox, которое позволяет переводить слова c Английского на Русский на web-сайтах и добавлять переводы в словарь на Lingualeo.

Ниже описан процесс сборки расширения.

### Для сборки требуется установить:
* [Node.js 6+](https://nodejs.org/en/)
* [Web-ext](https://github.com/mozilla/web-ext)

### Сборка

Все пути указаны относительно папки расширения.

* Сначала нужно установить зависимости:
    * `npm install`
* Далее необходимо наложить патч `iframeResizer.patch` на библиотеку iFrame Resizer, т.к. она не работает в среде расширения. В Linux это можно сделать командой patch:
    * `patch node_modules/iframe-resizer/js/iframeResizer.js < iframeResizer.patch`
* Далее выполнить сборку js-modules и транслировать *.vue файлы в js командой:
    * `npm run build`
* Далее собрать расширение в архив:
    * `cd extension/`
    * `web-ext build`

После выполнения этих команд, в `extension/web-ext-artifacts/` должен появиться файл расширения: `leo_translate-{Номер версии}.zip`

Чтобы установить расширение, нужно подписать его в addons.mozilla.org или (не рекомендуется!) переключить в Firefox на странице about:config параметр `xpinstall.signatures.required` в `false`  
