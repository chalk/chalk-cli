import test from 'ava';
import chalk from 'chalk';
import execa from 'execa';

chalk.level = 1;

const macro = async (t, {arguments: arguments_, options}, expected) => {
	const {stdout} = await execa('./cli.js', arguments_, options);
	t.is(stdout, expected);
};

const snapshotMacro = async (t, {arguments: arguments_, options}) => {
	const {stdout} = await execa('./cli.js', arguments_, options);
	t.snapshot(stdout);
};

const templateMacro = (t, input, expected) =>
	macro(t, {arguments: ['--template', input, '--no-stdin']}, expected);

test('help',
	async (t, {arguments: arguments_, options}, expectedRegex) => {
		const {stdout} = await execa('./cli.js', arguments_, options);
		t.regex(stdout, expectedRegex);
	},
	{arguments: ['--help']},
	/Terminal string styling done right/,
);

test('main', macro, {arguments: ['red', 'bold', 'unicorn', '--no-stdin']},
	chalk.red.bold('unicorn'));
test('default to args; not stdin (#11)', macro, {arguments: ['red', 'bold', 'unicorn'], options: {input: ''}},
	chalk.red.bold('unicorn'));
test('stdin', macro, {arguments: ['red', 'bold', '--stdin'], options: {input: 'unicorn'}},
	chalk.red.bold('unicorn'));
test('number', macro, {arguments: ['red', 'bold', '123', '--no-stdin']},
	chalk.red.bold('123'));

test('template', templateMacro, '{red.bold unicorn}',
	chalk.red.bold('unicorn'));
test('template strikethrough', templateMacro, '{red.bold unicorns} are {blue.strikethrough FUN!!!}',
	chalk.red.bold('unicorns') + ' are ' + chalk.blue.strikethrough('FUN!!!'));
test('template underline', templateMacro, '{red.bold unicorn {blue.underline dancing}}',
	chalk.red.bold('unicorn ') + chalk.red.bold.blue.underline('dancing'));
test('template negation', templateMacro, '{red red {~red normal}}',
	chalk.red('red ') + 'normal');

test('template escaping #1', templateMacro, '{red hey\\} still red} not red',
	chalk.red('hey} still red') + ' not red');
test('template escaping #2', templateMacro, '{red hey\\\\} not red',
	chalk.red('hey\\') + ' not red');

test('without -n, output has trailing newline', macro,
	{arguments: ['red', 'bold', 'unicorn'], options: {stripFinalNewline: false}},
	chalk.red.bold('unicorn') + '\n');
test('with -n, output has NO trailing newline', macro,
	{arguments: ['-n', 'red', 'bold', 'unicorn'], options: {stripFinalNewline: false}},
	chalk.red.bold('unicorn') /* No trailing newline */);
test('with --no-newline, output has NO trailing newline', macro,
	{arguments: ['--no-newline', 'red', 'bold', 'unicorn'], options: {stripFinalNewline: false}},
	chalk.red.bold('unicorn') /* No trailing newline */);

test('demo', snapshotMacro, {arguments: ['--demo']});

test('backslash escapes - \\t', macro,
	{arguments: ['red', 'bold', '\\tunicorn', '-e']},
	chalk.red.bold('\tunicorn'));
test('backslash escapes - \\b', macro,
	{arguments: ['red', 'bold', 'unicork\\bn', '-e']},
	chalk.red.bold('unicork\bn'));

test('unknown flag',
	async (t, {arguments: arguments_, options}, expectedRegex) => {
		try {
			await execa('./cli.js', arguments_, options);
		} catch (error) {
			t.is(error.exitCode, 2);
			t.regex(error.toString(), expectedRegex);
		}
	},
	{arguments: ['--this-is-not-a-supported-flag'], options: {input: 'unicorn'}},
	/Unknown flag/,
);
