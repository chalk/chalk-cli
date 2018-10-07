#!/usr/bin/env node
'use strict';
const ansiStyles = require('ansi-styles');
const chalk = require('chalk');
const dotProp = require('dot-prop');
const getStdin = require('get-stdin');
const meow = require('meow');

function demoFunction() {
	const demoString = [
		'bold',
		'dim',
		'italic',
		'underline',
		'inverse',
		'strikethrough',
		'black',
		'red',
		'green',
		'yellow',
		'blue',
		'magenta',
		'cyan',
		'white',
		'gray',
		'bgBlack',
		'bgRed',
		'bgGreen',
		'bgYellow',
		'bgBlue',
		'bgMagenta',
		'bgCyan',
		'bgWhite'
	];
	console.log(demoString.map(str => chalk[str](str)).join(' '));
}

const cli = meow(`
	Usage
	  $ chalk <style> … <string>
	  $ echo <string> | chalk <style> …

	Options
	  --template, -t  Style template. The \`~\` character negates the style.
	  --demo Demo of all Chalk styles.

	Examples
	  $ chalk red bold 'Unicorns & Rainbows'
	  $ chalk -t '{red.bold Unicorns & Rainbows}'
	  $ chalk -t '{red.bold Dungeons and Dragons {~bold.blue (with added fairies)}}'
`, {
	flags: {
		template: {
			type: 'string',
			alias: 't'
		},
		demo: {
			type: 'boolean',
			alias: 'd'
		}
	}
});

const styles = cli.input;

function init(data) {
	for (const style of styles) {
		if (!Object.keys(ansiStyles).includes(style)) {
			console.error(`Invalid style: ${style}`);
			process.exit(1);
		}
	}

	const fn = dotProp.get(chalk, styles.join('.'));
	console.log(fn(data.replace(/\n$/, '')));
}

if (process.stdin.isTTY || cli.flags.stdin === false) {
	if (cli.flags.demo) {
		demoFunction();
	} else if (cli.flags.template) {
		if (cli.input.length === 0) {
			try {
				const tagArray = [cli.flags.template];
				tagArray.raw = tagArray;
				console.log(chalk(tagArray));
			} catch (error) {
				console.error('Something went wrong! Maybe review your syntax?\n');
				console.error(error.stack);
				process.exit(1);
			}
		} else {
			console.error('The --template option only accepts 1 argument');
			process.exit(1);
		}
	} else {
		if (styles.length < 2) {
			console.error('Input required');
			process.exit(1);
		}

		init(styles.pop());
	}
} else {
	if (styles.length === 0) {
		console.error('Input required');
		process.exit(1);
	}

	getStdin().then(init);
}
