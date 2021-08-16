# Contributing

Contributions are welcome!

Release notes and the version number for the next
release are generated from the commit history.
Here are some guidelines on formatting your commits to make sure that the
release notes will be correct after your change is accepted.

Ignoring these guidelines is fine, but it means that your change may be squash-merged so that the changelog contains the right contents.

Release notes and version bumping are managed by `standard-version`. This uses the
[Conventional Commit](https://www.conventionalcommits.org/en/v1.0.0/) specification to decide what will appear in the changelog.

## Commits

In general the format is `<type>(<scope>): <message>`. The `scope` and the `message` can be anything.
The `type` can also be anything, but if it is `fix` or `feat` then it will appear in the release notes:

- `feat(options):` or `feat:` messages appear under "New Features", and trigger minor version bumps.
- `fix(some other scope):` or `fix:` messages appear under "Fixes and improvements", and trigger patch version bumps.

These communicate changes that users may want to know about. Not all changes that could be considered "fixes"
are changes that users would want to see in the changelog.
If you have a fix that shouldn't be in the changelog, some example types include `docs`, `chore`, `test`, `refactor`, `build` etc.

If your commit message introduces a breaking change, please indicate that it is a breaking change with `!`
after the type and scope. For example, the following commit message indicates a breaking change:

```
fix(something)!: The signature for the something method has changed
```

You can also include a footer in the commit that
starts with the text `BREAKING CHANGE:`. This is useful if you need to provide
more context. Markdown formatting is available in the footer section.

Breaking changes trigger major version bumps and always appear in the release notes, even if they are not `feat` or `fix`.

For more information, please see the
[Conventional Commit Specification](https://www.conventionalcommits.org/en/v1.0.0/)

## Cutting a release

To modify the changelog, bump the version, and create the appropriate git tag, run:

```
npm run release
```

If you just want to confirm what the release notes and version will be, you can do a dry run with:

```
npm run release -- --dry-run
```

If you need to do a prerelease version (say with a suffix of `-alpha`), you can do:

```
npm run release -- --prerelease alpha
```

For more information see the [standard-version documentation](https://github.com/conventional-changelog/standard-version#readme)
