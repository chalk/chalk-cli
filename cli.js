#!/usr/bin/env node
import process from 'node:process';
import ansiStyles from 'ansi-styles';
import chalk from 'chalk';
import dotProp from 'dot-prop';
import getStdin from 'get-stdin';
import meow from 'meow';

const printAllStyles = () => {
	const textStyles = ['bold', 'dim', 'italic', 'underline', 'strikethrough'];
	const colorStyles = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray'];
	const brightColorStyles = ['blackBright', 'redBright', 'greenBright', 'yellowBright', 'blueBright', 'magentaBright', 'cyanBright', 'whiteBright'];
	const bgColorStyles = ['bgBlack', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta', 'bgCyan', 'bgWhite', 'bgGray'];
	const bgBrightColorStyles = ['bgBlackBright', 'bgRedBright', 'bgGreenBright', 'bgYellowBright', 'bgBlueBright', 'bgMagentaBright', 'bgCyanBright', 'bgWhiteBright'];

	function styled(style, text) {
		if (/^bg[^B]/.test(style)) {
			text = chalk.black(text);
		}

		return chalk[style](text);
	}

	function showStyles(stylesArray) {
		const output = stylesArray.map(style => styled(style, style)).join(' ');
		console.log(output);
	}

	console.log('Available styles:\n');
	showStyles(textStyles);
	showStyles(colorStyles);
	showStyles(brightColorStyles);
	showStyles(bgColorStyles);
	showStyles(bgBrightColorStyles);
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
	allowUnknownFlags: false,
	flags: {
		// TODO: Can be removed when https://github.com/sindresorhus/meow/issues/197 is fixed.
		help: {
			type: 'boolean',
		},
		version: {
			type: 'boolean',
		},

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

function handleTemplateFlag(template) {
	if (cli.input.length > 0) {
		console.error('The --template option only accepts 1 argument');
		process.exitCode = 1;
		return;
	}

	try {
		const tagArray = [template];
		tagArray.raw = tagArray;
		console.log(chalk(tagArray));
	} catch (error) {
		console.error('Something went wrong! Maybe review your syntax?\n');
		console.error(error.stack);
		process.exitCode = 1;
	}
}

function init(data) {
	for (const style of styles) {
		if (!Object.keys(ansiStyles).includes(style)) {
			console.error(chalk`{red Invalid style: {bold ${style}}}\n`);
			printAllStyles();
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
		return;
	}

	if (cli.flags.template) {
		handleTemplateFlag(cli.flags.template);
		return;
	}

	if (styles.length < 2) {
		console.error('Input required');
		process.exitCode = 1;
		return;
	}

	init(styles.pop());
}

async function processDataFromStdin() {
	if (styles.length === 0) {
		console.error('Input required');
		process.exitCode = 1;
		return;
	}

	init(await getStdin());
}

if (process.stdin.isTTY || !cli.flags.stdin) {
	processDataFromArgs();
} else {
	processDataFromStdin();
}
