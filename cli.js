#!/usr/bin/env node
'use strict';
const ansiStyles = require('ansi-styles');
const chalk = require('chalk');
const dotProp = require('dot-prop');
const getStdin = require('get-stdin');
const meow = require('meow');

const printAllStyles = () => {
	const styles = [
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

	console.log(styles.map(style => chalk[style](style)).join(' '));
};

const cli = meow(`
	Usage
	  $ chalk <style> … <string>
	  $ echo <string> | chalk --stdin <style> …

	Options
	  --template, -t  Style template. The \`~\` character negates the style.
	  --demo          Demo of all Chalk styles.
	  --stdin         Read input from stdin rather than from arguments.

	Examples
	  $ chalk red bold 'Unicorns & Rainbows'
	  $ chalk -t '{red.bold Unicorns & Rainbows}'
	  $ chalk -t '{red.bold Dungeons and Dragons {~bold.blue (with added fairies)}}'
	  $ echo 'Unicorns from stdin' | chalk --stdin red bold
`, {
	flags: {
		stdin: {
			type: 'boolean'
		},
		template: {
			type: 'string',
			alias: 't'
		},
		demo: {
			type: 'boolean'
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

if (process.stdin.isTTY || cli.flags.stdin !== true) {
	if (cli.flags.demo) {
		printAllStyles();
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
