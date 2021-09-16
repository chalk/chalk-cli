# chalk-cli

> Terminal string styling done right

[![npm dependents](https://badgen.net/npm/dependents/chalk-cli)](https://www.npmjs.com/package/chalk-cli?activeTab=dependents) [![Downloads](https://badgen.net/npm/dt/chalk-cli)](https://www.npmjs.com/package/chalk-cli)
[![run on repl.it](https://repl.it/badge/github/chalk/chalk-cli)](https://repl.it/github/chalk/chalk-cli)
[![Support Chalk on DEV](https://badge.devprotocol.xyz/0x44d871aebF0126Bf646753E2C976Aa7e68A66c15/descriptive)](https://stakes.social/0x44d871aebF0126Bf646753E2C976Aa7e68A66c15)

<img src="screenshot.png" width="631">

## Install

```
$ npm install --global chalk-cli
```

## Usage

```
$ chalk --help

  Usage
    $ chalk <style> ... <string>
    $ echo <string> | chalk <style> ...

  Options
    --template, -t    Style template. The `~` character negates the style.
    --stdin           Read input from stdin rather than from arguments.
    --no-newline, -n  Don't emit a newline (`\n`) after the input.
    --demo            Demo of all Chalk styles.

  Examples
    $ chalk red bold 'Unicorns & Rainbows'
    $ chalk -t '{red.bold Unicorns & Rainbows}'
    $ chalk -t '{red.bold Dungeons and Dragons {~bold.blue (with added fairies)}}'
    $ echo 'Unicorns from stdin' | chalk --stdin red bold
```

See [supported styles](https://github.com/chalk/chalk#styles).

## Template syntax

- `{red.bold unicorn}`
- `{red.bold unicorns} are {blue FUN!!!}`
- `{red.bold unicorn {blue.underline dancing}}`
- `{red red {~red normal}}`
- `{red hey\} still red} not red`
- `{red hey\\} not red`

## Related

- [chalk](https://github.com/chalk/chalk) - API for this module

## Maintainers

- [Sindre Sorhus](https://github.com/sindresorhus)
- [Josh Junon](https://github.com/qix-)
