# chalk-cli [![Build Status](https://travis-ci.org/chalk/chalk-cli.svg?branch=master)](https://travis-ci.org/chalk/chalk-cli)

> Terminal string styling done right

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
    $ chalk -t/--template {<style> ... <string>}

  Example
    $ chalk red bold 'Unicorns & Rainbows'
    $ chalk -t '{red.bold Unicorns & Rainbows}'
```

See [supported styles](https://github.com/chalk/chalk#styles).


## Related

- [chalk](https://github.com/chalk/chalk) - API for this module

## Template Syntax

Examples:
- `{red.bold unicorn}`
- `{red.bold unicorns} are {blue FUN!!!}`
- `{red.bold unicorn {blue.underline dancing}}`
- `{red red {~red normal}}`
- `{red hey\} still red} not red`
- `{red hey\\} not red`

## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
