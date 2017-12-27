# tamia-changelog

[![Build Status](https://travis-ci.org/sapegin/tamia-changelog.svg)](https://travis-ci.org/sapegin/tamia-changelog)

Change log draft generator. Should be used with [semantic-release-tamia](https://github.com/tamiadev/semantic-release-tamia).

## Installation

```
npm install --save-dev tamia-changelog
```

## Release process

To release a new version, you'll need to create a commit with `Changelog` type.

To generate change log draft run `tamia-changelog`. It will create a file with all important commits for the release grouped by type (breaking changes, new features and bugfixes) and open it in your default editor.

Now you can rewrite your change log to make it valuable for your users.

To commit change log run `tamia-changelog commit`. It will make a commit without changes (`git commit --allow-empty`) of type Changelog and change log in commit message body.

## Change log

The change log can be found on the [Releases page](https://github.com/sapegin/tamia-changelog/releases).

## Contributing

Everyone is welcome to contribute. Please take a moment to review the [contributing guidelines](Contributing.md).

## Authors and license

[Artem Sapegin](http://sapegin.me) and [contributors](https://github.com/sapegin/tamia-changelog/graphs/contributors).

MIT License, see the included [License.md](License.md) file.
