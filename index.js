#!/usr/bin/env node

/*
 * 1. Generates a changelog and opens it in the default editor.
 * 2. Commits a changelog as a commit message.
 *
 * Usage:
 *   tamia-changelog [commit]
 *
 * Author: Artem Sapegin, sapegin.me
 * License: MIT
 * https://github.com/sapegin/dotfiles
 */

const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;
const opn = require('opn');
const through = require('through2');
const shellEscape = require('shell-escape');
const gitLatestSemverTag = require('git-latest-semver-tag');
const commitsBetween = require('commits-between');
const getPkgRepo = require('get-pkg-repo');
const conventionalCommitsParser = require('conventional-commits-parser').sync;
const conventionalChangelogWriter = require('conventional-changelog-writer');
const parserOpts = require('semantic-release-tamia/lib/parser-opts');
const writerOpts = require('./writer-opts');

const CHANGELOG_FILE = 'Changelog.md';
const TYPE_FEATURE = 'Feat';
const TYPE_FIX = 'Fix';
const TYPE_CHANGELOG = 'Changelog';

const is = (a, b) => (a || '').toUpperCase() === (b || '').toUpperCase();

const hasBreakingChanges = commit =>
	commit.notes &&
	!!commit.notes.find(c => parserOpts.noteKeywords.includes(c.title));

function error(message) {
	console.error(message);
	process.exit(1);
}

function usage() {
	const appName = path.basename(process.argv[1]);
	return `
Usage:
  ${appName} [commit]
  `.trim();
}

function parseCommits(commits, cb) {
	const changes = commits
		.map(parseCommit)
		.filter(commit => commit && commit.type);
	cb(null, changes);
}

function parseCommit(commit) {
	const parsed = conventionalCommitsParser(
		`${commit.subject}\n\n${commit.body}`,
		parserOpts
	);
	return Object.assign({}, parsed, {
		type: getCommitType(parsed),
	});
}

function getCommitType(commit) {
	if (hasBreakingChanges(commit)) {
		return 'breaking';
	} else if (is(commit.type, TYPE_FEATURE) || is(commit.type, TYPE_FIX)) {
		return commit.type.toLowerCase();
	}
	return null;
}

function generateChangelog(changes, done) {
	const chunks = [];
	getChangesStream(changes)
		.pipe(getWriterStream())
		.on('error', err => {
			console.error(`Cannot generate change log: ${err}`);
			process.exit(1);
		})
		.on('end', () => {
			done(chunks.join('\n\n').trim());
		})
		.pipe(
			through((chunk, enc, cb) => {
				chunks.push(chunk.toString());
				cb();
			})
		);
}

function getChangesStream(changes) {
	const stream = through.obj();
	changes.forEach(x => stream.write(x));
	stream.end();
	return stream;
}

function getWriterStream() {
	try {
		return conventionalChangelogWriter(getTemplateContext(), writerOpts);
	} catch (err) {
		console.error(err.toString());
		process.exit(1);
		return false;
	}
}

function getTemplateContext() {
	const pkg = require(path.resolve(process.cwd(), 'package.json'));
	const repo = getPkgRepo(pkg);
	return {
		host: `${repo.default}://${repo.domain}`,
		owner: repo.user,
		repository: repo.project,
	};
}

function buildChangelog() {
	gitLatestSemverTag((err, tag) => {
		if (err) {
			error(err);
		}

		console.log(`Generating changelog since ${tag}...`);

		commitsBetween({ from: tag }).then(commits => {
			console.log(`${commits.length} commits found.`);
			if (!commits.length) {
				return;
			}

			parseCommits(commits, (err, changes) => {
				if (err) {
					error(err);
				}

				generateChangelog(changes, changelog => {
					fs.writeFileSync(CHANGELOG_FILE, changelog);
					opn(CHANGELOG_FILE, { wait: false });
				});
			});
		}, error);
	});
}

function commitChangelog() {
	if (!fs.existsSync(CHANGELOG_FILE)) {
		error(`Changelog file not found: "${CHANGELOG_FILE}".`);
	}

	console.log('Commiting changelog...');

	const changelog = fs.readFileSync(CHANGELOG_FILE, 'utf8');
	gitCommit(`${TYPE_CHANGELOG}: 🚀`, changelog, '--allow-empty', err => {
		if (err) {
			console.log('Cannot commit', err);
			return;
		}

		console.log('Done.');
		console.log('');
		console.log('Don’t forget to push!');
	});
}

function gitCommit(head, body, options, callback) {
	exec(
		'git commit ' + shellEscape([options, '-m', `${head}\n\n${body}`]),
		callback
	);
}

const command = process.argv[2];
if (command) {
	if (command === 'commit') {
		commitChangelog();
	} else {
		error(`Unknown command "${command}".\n\n${usage()}`);
	}
} else {
	buildChangelog();
}
