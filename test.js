import childProcess from 'child_process';
import test from 'ava';
import chalk from 'chalk';
import pify from 'pify';

const exec = pify(childProcess.exec);

process.env.FORCE_COLOR = true;
chalk.enabled = true;

test('main', async t => {
	const stdout = await exec('./cli.js red bold unicorn --no-stdin');
	t.is(stdout.trim(), chalk.red.bold('unicorn'));
});

test('stdin', async t => {
	const stdout = await exec('echo unicorn | ./cli.js red bold');
	t.is(stdout.trim(), chalk.red.bold('unicorn'));
});

test('number', async t => {
	const stdout = await exec('./cli.js red bold 123 --no-stdin');
	t.is(stdout.trim(), chalk.red.bold('123'));
});
