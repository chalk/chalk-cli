'use strict';
const chalk = require('chalk');
const dotProp = require('dot-prop');
const exclude = require('arr-exclude');

function data(parent) {
	return {
		styles: [],
		parent,
		contents: []
	};
}

const zeroBound = n => n < 0 ? 0 : n;
const lastIndex = a => zeroBound(a.length - 1);

const last = a => a[lastIndex(a)];

const takeWhileReverse = (array, predicate, start = -1) => {
	if (start < 0) {
		start = array.length + start;
	}

	const out = [];

	for (let i = start; i >= 0 && i <= start; i--) {
		if (predicate(array[i])) {
			out.unshift(array[i]);
		} else {
			break;
		}
	}

	return out;
};

/**
 * Checks if the character at position i in string is a normal character a.k.a a non control character.
 * */
const isNormalCharacter = (string, i) => {
	const char = string[i];
	const backslash = '\\';

	if (!(char === backslash || char === '{' || char === '}')) {
		return true;
	}

	const n = i === 0 ? 0 : takeWhileReverse(string, x => x === '\\', zeroBound(i - 1)).length;

	return n % 2 === 1;
};

const collectStyles = data => data ? collectStyles(data.parent).concat(data.styles) : ['reset'];

/**
 * Computes the style for a given data based on it's style and the style of it's parent. Also accounts for !style styles
 * which remove a style from the list if present.
 * */
const sumStyles = data => {
	const negateRegex = /^~.+/;
	let out = [];

	for (const style of collectStyles(data)) {
		if (negateRegex.test(style)) {
			out = exclude(out, style.slice(1));
		} else {
			out.push(style);
		}
	}

	return out;
};

/**
 * Takes a string and parses it into a tree of data objects which inherit styles from their parent.
 * */
function parse(string) {
	const root = data(null);
	let pushingStyle = false;

	let current = root;

	for (let i = 0; i < string.length; i++) {
		const char = string[i];

		if (pushingStyle) {
			if (char === ' ') {
				pushingStyle = false;
			} else if (char === '.') {
				current.styles.push('');
			} else {
				current.styles[lastIndex(current.styles)] = (last(current.styles) || '') + char;
			}
		} else if (isNormalCharacter(string, i)) {
			const lastChunk = last(current.contents);

			if (typeof lastChunk === 'string') {
				current.contents[lastIndex(current.contents)] = lastChunk + char;
			} else {
				current.contents.push(char);
			}
		} else if (char === '{') {
			pushingStyle = true;
			const nCurrent = data(current);
			current.contents.push(nCurrent);
			current = nCurrent;
		} else if (char === '}') {
			current = current.parent;
		}
	}

	if (current !== root) {
		throw new Error('Remember to close blocks!');
	}

	return root;
}

/**
 * Takes a tree of data objects and flattens it to a list of data objects with the inherited and negations styles
 * accounted for.
 * */
function flatten(data) {
	let flat = [];

	for (const content of data.contents) {
		if (typeof content === 'string') {
			flat.push({styles: sumStyles(data), content});
		} else {
			flat = flat.concat(flatten(content));
		}
	}

	return flat;
}

/**
 * Checks if a given style is valid.
 * */
function validateStyle(style) {
	if (Object.keys(chalk.styles).indexOf(style) === -1) {
		throw new Error(`Invalid style: ${style}`);
	}
}

/**
 * Performs the actual styling of the string, essentially lifted from cli.js.
 * */
function style(flat) {
	return flat.map(data => {
		data.styles.forEach(validateStyle);

		const fn = dotProp.get(chalk, data.styles.join('.'));
		return fn(data.content.replace(/\n$/, ''));
	}).join('');
}

module.exports = string => style(flatten(parse(string)));
