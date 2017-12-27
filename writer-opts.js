// Based on conventional-changelog-angular

const fs = require('fs');
const path = require('path');

const template = x =>
	fs.readFileSync(path.resolve(__dirname, `./templates/${x}.hbs`), 'utf-8');

module.exports = {
	mainTemplate: template('template'),
	headerPartial: template('header'),
	commitPartial: template('commit'),
	footerPartial: template('footer'),
	transform: (commit, context) => {
		let discard = true;
		const issues = [];

		commit.notes.forEach(note => {
			note.title = 'Breaking changes';
			discard = false;
		});

		if (commit.type === 'feat') {
			commit.type = 'New features';
		} else if (commit.type === 'fix') {
			commit.type = 'Bug fixes';
		} else if (discard) {
			return false;
		}

		if (typeof commit.hash === 'string') {
			commit.hash = commit.hash.substring(0, 7);
		}

		if (typeof commit.subject === 'string') {
			let url = context.repository
				? `${context.host}/${context.owner}/${context.repository}`
				: context.repoUrl;
			if (url) {
				url = `${url}/issues/`;
				// Issue URLs
				commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
					issues.push(issue);
					return `[#${issue}](${url}${issue})`;
				});
			}
			if (context.host) {
				// User URLs
				commit.subject = commit.subject.replace(
					/\B@([a-z0-9](?:-?[a-z0-9]){0,38})/g,
					`[@$1](${context.host}/$1)`
				);
			}
		}

		// Remove references that already appear in the subject
		commit.references = commit.references.filter(reference => {
			if (issues.indexOf(reference.issue) === -1) {
				return true;
			}

			return false;
		});

		console.log(commit);

		return commit;
	},
	groupBy: 'type',
	commitGroupsSort: (a, b) => {
		if (b.title === 'Breaking changes') {
			return 1;
		}
		if (b.title === 'New features') {
			return 1;
		}
		return 0;
	},
	commitsSort: 'subject',
	noteGroupsSort: 'title',
};
