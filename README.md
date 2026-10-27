## Introduction

These plugins provide an alternative TiddlyWiki icons set using the [Lucide icons](https://lucide.dev/) as a basis.

## Compatibility

The "lucide-core" plugin should be a 100% compatible "drop in replacement" for the TiddlyWiki core icons.

With TW v5.3.0 the internal icon structure has been changed, so the initial plugins are only compatible with TW versions v5.3.0 and higher.

## Demos

- https://pmario.github.io/lucide-tiddlywiki-plugin ... Lucide Core plugin
- https://pmario.github.io/lucide-tiddlywiki-plugin/lucide-all.html ... Users can create their own custom icon sets, to add project specific icons

## To "compile" the TW plugins yourself

The "lucide-all" plugin contains all Lucide icons plus the [Lucide Lab](https://github.com/lucide-icons/lucide/tree/main/lab) icons. Lab icons are tagged `$:/tags/Image/Lucide/Lab` in addition to `$:/tags/Image/Lucide`.

- Clone this repository and the Lucide repository side by side. The Lucide repository only provides the SVG source files, it needs no `npm install`.

```
cd /your/project/path
git clone https://github.com/pmario/lucide-tiddlywiki-plugin.git lucide-svg-plugin
git clone https://github.com/lucide-icons/lucide.git
```

- Install the dev-dependencies and build

```
cd lucide-svg-plugin
npm install
npm run build
```

The build reads `../lucide/icons` and `../lucide/lab`. If the Lucide repository is somewhere else, set the `LUCIDE_DIR` environment variable to its path. Converting the "stroke" icons into outlines takes about a minute.

Once this command is finished, you can start the lucide-all test server with:

```
tiddlywiki .\edition\lucide-all-server\ --listen
```

- Open the dev-server with http://localhost:8080


If TiddlyWiki is not installed yet, you can install it with

```
npm install -D tiddlywiki

or, if you want to install TW globally 

npm install -g tiddlywiki
```

have fun!<br>
Mario
