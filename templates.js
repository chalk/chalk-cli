'use strict';
const chalk = require('chalk');
const dotProp = require('dot-prop');
const _ = require('lodash');

function data(parent) {
	return {
		styles: [],
		parent,
		contents: []
	};
}

/**
 * Checks if the character at position i in string is a control character accounting for escaping (and escaping of the
 * escape character).
 * */
const isNonControl = (string, i) => (string[i - 1] === '\\' && string[i - 1] !== '\\') || !(string[i] === '{' || string[i] === '}');

const collectStyles = data => data ? collectStyles(data.parent).concat(data.styles) : ['reset'];

/**
 * Computes the style for a given data based on it's style and the style of it's parent. Also accounts for !style styles
 * which remove a style from the list if present.
 * */
const sumStyles = data => {
	const negateRegex = /^!.+/;
	let out = [];

	for (const style of collectStyles(data)) {
		if (negateRegex.test(style)) {
			out = _.without(out, style.slice(1));
		} else {
			out.push(style);
		}
	}

	return out;
};

const zeroBound = n => n < 0 ? 0 : n;
const lastIndex = a => zeroBound(a.length - 1);

const last = a => a[lastIndex(a)];

/**
 * Takes a string and parses it into a tree data objects which inherit styles from their parent.
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
		} else if (isNonControl(string, i)) {
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
