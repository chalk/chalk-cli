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

const testTemplate = async (t, string, correct) => {
	const stdout = await exec(`./cli.js -t '${string}' --no-stdin`);
	t.is(stdout.trim(), correct);
};

test('template basic', async t => {
	await testTemplate(t, '{red.bold unicorn}', chalk.reset.red.bold('unicorn'));

	await testTemplate(t, '{red.bold unicorns} are {blue.strikethrough FUN!!!}',
		chalk.reset.red.bold('unicorns') + chalk.reset(' are ') + chalk.reset.blue.strikethrough('FUN!!!'));

	await testTemplate(t, '{red.bold unicorn {blue.underline dancing}}',
		chalk.reset.red.bold('unicorn ') + chalk.reset.red.bold.blue.underline('dancing'));
});

test('template negation', async t => {
	await testTemplate(t, '{red red {~red normal}}',
		chalk.reset.red('red ') + chalk.reset('normal'));
});

test('template escaping', async t => {
	await testTemplate(t, '{red hey\\} still red} not red',
		chalk.reset.red('hey} still red') + chalk.reset(' not red'));

	await testTemplate(t, '{red hey\\\\} not red',
		chalk.reset.red('hey\\') + chalk.reset(' not red'));
});
