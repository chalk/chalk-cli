#!/usr/bin/env node
import process from 'node:process';
import ansiStyles from 'ansi-styles';
import chalk from 'chalk';
import dotProp from 'dot-prop';
import getStdin from 'get-stdin';
import meow from 'meow';

const printAllStyles = () => {
	const allStyles = [
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
	allStyles.sliceByValue = function (startValue, endValue) {
		return this.slice(this.indexOf(startValue), this.indexOf(endValue) + 1);
	};

	function showStyles(styles) {
		console.log(styles.map(style => chalk[style](style)).join(' '));
	}

	const textStyles = allStyles.sliceByValue('bold', 'strikethrough');
	const colorStyles = allStyles.sliceByValue('black', 'gray');
	const bgColorStyles = allStyles.sliceByValue('bgBlack', 'bgWhite');

	console.log('Available styles:\n');
	showStyles(textStyles);
	showStyles(colorStyles);
	showStyles(bgColorStyles);
};

const cli = meow(`
	Usage
	  $ chalk <style> … <string>
	  $ echo <string> | chalk --stdin <style> …

	Options
	  --template, -t    Style template. The \`~\` character negates the style.
	  --stdin           Read input from stdin rather than from arguments.
	  --no-newline, -n  Don't emit a newline (\`\\n\`) after the input.
	  --demo            Demo of all Chalk styles.

	Examples
	  $ chalk red bold 'Unicorns & Rainbows'
	  $ chalk -t '{red.bold Unicorns & Rainbows}'
	  $ chalk -t '{red.bold Dungeons and Dragons {~bold.blue (with added fairies)}}'
	  $ echo 'Unicorns from stdin' | chalk --stdin red bold
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
