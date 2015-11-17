#!/usr/bin/env node
'use strict';
const getStdin = require('get-stdin');
const meow = require('meow');
const chalk = require('chalk');
const dotProp = require('dot-prop');

const cli = meow(`
	Usage
	  $ chalk <style> ... <string>
	  $ echo <string> | chalk <style> ...

	Example
	  $ chalk red bold 'Unicorns & Rainbows'
`, {
	string: ['_']
});

const styles = cli.input;

function init(data) {
	styles.forEach(x => {
		if (Object.keys(chalk.styles).indexOf(x) === -1) {
			console.error(`Invalid style: ${x}`);
			process.exit(1);
		}
	});

	const fn = dotProp.get(chalk, styles.join('.'));
	console.log(fn(data.replace(/\n$/, '')));
}

if (process.stdin.isTTY || cli.flags.stdin === false) {
	if (styles.length < 2) {
		console.error('Input required');
		process.exit(1);
	}

	init(styles.pop());
} else {
	if (styles.length < 1) {
		console.error('Input required');
		process.exit(1);
	}

	getStdin().then(init);
}
