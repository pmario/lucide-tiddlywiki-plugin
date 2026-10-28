## Introduction

These plugins provide an alternative TiddlyWiki icons set using the [Lucide icons](https://lucide.dev/) as a basis.

## Compatibility

The "lucide-core" plugin should be a 100% compatible "drop in replacement" for the TiddlyWiki core icons.

With TW v5.3.0 the internal icon structure has been changed, so the initial plugins are only compatible with TW versions v5.3.0 and higher.

## Demos

- https://pmario.github.io/lucide-tiddlywiki-plugin ... Lucide Core plugin
- https://pmario.github.io/lucide-tiddlywiki-plugin/lucide-all.html ... Users can create their own custom icon sets, to add project specific icons
- https://pmario.github.io/lucide-tiddlywiki-plugin/lucide-core-line.html ... Lucide Core Line plugin
- https://pmario.github.io/lucide-tiddlywiki-plugin/lucide-line.html ... Custom icon sets from line icons

## Line icons

The "lucide-core" and "lucide-all" plugins contain Lucide icons converted into filled outlines, so they work like the TW core icons. The line plugins keep Lucide's original line drawings, which are much smaller:

- "lucide-core-line" replaces the TW core icons with line icons. Its stylesheets give them the colours the core icons get from the Vanilla, Snow White and Seamless themes and from the TW plugins. The line width is set in `$:/config/lucide-line/stroke-width` (default 2).
- "lucide-line" contains all Lucide and Lucide Lab icons as `$:/lucide/line/<name>`.

Things to know:

- Icon-set plugins made from line icons need "lucide-core-line" installed. Without it, the theme fills the icons.
- The stroke width rule applies to every `svg[stroke="currentColor"]`, so it also hits Tabler icons from other plugins. Tabler icons are similar, but they do not follow all of Lucide's rules.
- Custom CSS or third-party themes that colour icons with `fill` need the same rule with `stroke` for line icons.

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

The editions are built with the TiddlyWiki version pinned in `package.json`, which `npm install` installs locally. The npm scripts use it, even if TiddlyWiki is installed globally.

Once this command is finished, you can start the lucide-all test server with:

```
npm start
```

- Open the dev-server with http://localhost:8080

### Line icon builds

```
npm run build:lucide-line # line plugins and search tiddlers
npm run make-lucide-line # build:lucide-line, then output/lucide-line/lucide-line.html
npm run make-docs-line # build:lucide-line, then docs/lucide-core-line.html and docs/lucide-line.html
npm run start:lucide-line # dev-server on http://localhost:8081
```

- `scripts/build-lucide-core-line.mjs` writes the core images and generates the stroke colour stylesheets from the `fill` rules of the installed TiddlyWiki version. Do not edit the generated `stroke-colours*.tid` files.
- Both core plugins set `plugin-priority: 10`, so their images win over the icons other plugins ship for the same titles.
- Custom icons keep their `fill="currentColor"` parts, because `scripts/render/processOrigin.mjs` runs SVGO with `preserveCurrentColor`.
- The docs builds leave local tiddlers out with a `publishFilter`, e.g. the icon-set drafts and `$:/Import`.

have fun!<br>
Mario
