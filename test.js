'use strict';
var test = require('ava');
var childProcess = require('child_process');
var chalk = require('chalk');

process.env.FORCE_COLOR = true;

test('main', function (t) {
	t.plan(2);

	childProcess.exec('./cli.js red bold unicorn --no-stdin', function (err, stdout) {
		t.assert(!err, err);
		t.assert(stdout.trim() === chalk.red.bold('unicorn'));
	});
});

test('stdin', function (t) {
	t.plan(2);

	childProcess.exec('echo unicorn | ./cli.js red bold', function (err, stdout) {
		t.assert(!err, err);
		t.assert(stdout.trim() === chalk.red.bold('unicorn'));
	});
});
