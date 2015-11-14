#!/usr/bin/env node
'use strict';
var getStdin = require('get-stdin');
var meow = require('meow');
var chalk = require('chalk');
var dotProp = require('dot-prop');

var cli = meow([
	'Usage',
	'  $ chalk <style> ... <string>',
	'  $ echo <string> | chalk <style> ...',
	'',
	'Example',
	'  $ chalk red bold \'Unicorns & Rainbows\''
]);

var styles = cli.input;

function init(data) {
	styles.forEach(function (el) {
		if (Object.keys(chalk.styles).indexOf(el) === -1) {
			console.error('Invalid style:', el);
			process.exit(1);
		}
	});

	var fn = dotProp.get(chalk, styles.join('.'));
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

