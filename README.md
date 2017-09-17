# LeoTranslate

It's an add-on for the Firefox browser that helps you translate a words from English to Russian and let you add these words to your dictionary. 

The installation process is described below.

### Requirements
* [Node.js 6+](https://nodejs.org/en/)
* [Web-ext](https://github.com/mozilla/web-ext)

### Build the extension

All the paths is specified relatively to the root of the repository.

* First of all you need to install dependencies:
    * `npm install`
* Next, you need to apply the patch `iframeResizer.patch` to the iFrame Resizer library, because it does not work in extension environment. If you have a Linux system, you can do it with the patch command:
    * `patch node_modules/iframe-resizer/js/iframeResizer.js < iframeResizer.patch`
* Next, you need to translate all the vue components to plain javascript code with the command:
    * `npm run build`
* Next, you need to pack the extension into zip-file:
    * `cd extension/`
    * `web-ext build`


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
