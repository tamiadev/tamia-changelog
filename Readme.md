# tamia-changelog

[![Build Status](https://travis-ci.org/tamiadev/tamia-changelog.svg)](https://travis-ci.org/tamiadev/tamia-changelog)

Change log draft generator for [semantic-release-tamia](https://github.com/tamiadev/semantic-release-tamia).

## Release process

1. Generate a change log draft by runnig `npx tamia-changelog`. It will create a file with all _important_ commits for the release grouped by type (breaking changes, new features and bugfixes) and open it in your default editor.

2. Rewrite your change log to make it valuable for your users.

3. Commit the change log by running `npx tamia-changelog commit`. It will make a commit without changes (`git commit --allow-empty`) of type Changelog and change log in commit message body.

## Change log

The change log can be found on the [Releases page](https://github.com/tamiadev/tamia-changelog/releases).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](Contributing.md).

## Authors and license

[Artem Sapegin](http://sapegin.me) and [contributors](https://github.com/tamiadev/tamia-changelog/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
