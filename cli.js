#!/usr/bin/env node
import process from 'node:process';
import ansiStyles from 'ansi-styles';
import chalk from 'chalk';
import dotProp from 'dot-prop';
import getStdin from 'get-stdin';
import meow from 'meow';

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
		'bgWhite',
	];

	console.log(styles.map(style => chalk[style](style)).join(' '));
};

const cli = meow(`
	${chalk.greenBright.inverse(' Usage ')}

	  $ ${chalk.green('chalk')} ${chalk.yellow('[options…]')} ${chalk.cyan('<style> … <string>')}
	  $ ${chalk.green('echo')} ${chalk.cyan('<string>')} | ${chalk.green('chalk')} ${chalk.yellow('--stdin [options…]')} ${chalk.cyan('<style> …')}

	${chalk.yellowBright.inverse(' Options ')}

	  ${chalk.yellow('--template, -t')}    Style template. The \`~\` character negates the style.
	  ${chalk.yellow('--stdin')}           Read input from stdin rather than from arguments.
	  ${chalk.yellow('--no-newline, -n')}  Don't emit a newline (\`\\n\`) after the input.
	  ${chalk.yellow('--demo')}            Demo of all Chalk styles.

	${chalk.redBright.inverse(' Examples ')}

	  $ chalk red bold 'Unicorns & Rainbows'
	  ${chalk.red.bold('Unicorns & Rainbows')}

	  $ chalk -t '{red.bold Unicorns & Rainbows}'
	  ${chalk.red.bold('Unicorns & Rainbows')}

	  $ chalk -t '{red.bold Dungeons and Dragons {~bold.blue (with added fairies)}}'
	  ${chalk`{red.bold Dungeons and Dragons {~bold.blue (with added fairies)}}`}

	  $ echo 'Unicorns from stdin' | chalk --stdin red bold
	  ${chalk.red.bold('Unicorns from stdin')}
`, {
	importMeta: import.meta,
	// TODO: Disabled until https://github.com/sindresorhus/meow/issues/197 is fixed.
	// allowUnknownFlags: false,
	flags: {
		template: {
			type: 'string',
			alias: 't',
		},
		stdin: {
			type: 'boolean',
		},
		noNewline: {
			type: 'boolean',
			alias: 'n',
		},
		demo: {
			type: 'boolean',
		},
	},
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
	process.stdout.write(fn(data.replace(/\n$/, '')));

	// The following is unfortunately a bit complex, because we're trying to
	// support both `-n` and `--no-newline` flags and this is a little tricky
	// with the current state of [meow](https://www.npmjs.com/package/meow) and
	// [yargs-parser](https://github.com/yargs/yargs-parser), which meow uses.
	//
	// There are two conditions in the following `if` statement:
	//
	//   - `cli.flags.noNewline` is set when `-n` is passed.
	//   - `cli.flags.newline` is set to `false` when `--no-newline` is passed.
	//
	//  We're hoping to simplify this in the future. See:
	//  https://github.com/chalk/chalk-cli/issues/30
	//
	if (!cli.flags.noNewline && cli.flags.newline !== false) {
		process.stdout.write('\n');
	}
}

function processDataFromArgs() {
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
}

async function processDataFromStdin() {
	if (styles.length === 0) {
		console.error('Input required');
		process.exit(1);
	}

	init(await getStdin());
}

if (process.stdin.isTTY || !cli.flags.stdin) {
	processDataFromArgs();
} else {
	processDataFromStdin();
}
