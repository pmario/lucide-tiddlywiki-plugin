## Introduction

These plugins provide an alternative TiddlyWiki icons set using the [Lucide icons](https://lucide.dev/) as a basis.

## Compatibility

The "lucide-core" plugin should be a 100% compatible "drop in replacement" for the TiddlyWiki core icons.

With TW v5.3.0 the internal icon structure has been changed, so the initial plugins are only compatible with TW versions v5.3.0 and higher.

## Demos

- https://pmario.github.io/lucide-tiddlywiki-plugin ... Lucide Core plugin
- https://pmario.github.io/lucide-tiddlywiki-plugin/lucide-all.html ... Users can create their own custom icon sets, to add project specific icons

## To "compile" the TW plugins yourself

The following steps are needed:

- Clone this repository and install dev-dependencies:

```
cd /your/project/path
clone https://github.com/pmario/lucide-tiddlywiki-plugin.git
cd lucide-tiddlywiki-plugin
npm install
```

- Clone the Lucide.dev repository and install dev-dependencies

```
cd /your/project/path
clone https://github.com/lucide-icons/lucide.git
cd lucide
npm install
```

- Run the command to convert "stroke" based icons to outlines
  - pnpm is only needed, if you did not install it globally yet
- This command should populate the directory `outlined` with 1500++ svg files

```
npm install -D pnpm
npm run build:outline-icons
```

- On Windows **copy** the "outlined" directory over to `..\lucide-svg-plugin\outlined`
- On linux based OS you can create a "symlink" to `../lucide-svg-plugin/outlined`

- Change directory to `lucide-svg-plugin`

```
cd ../lucide-svg-plugin
npm run build
```

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
