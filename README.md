# Correct yarn formatting

TLDR; A plugin that will reset your package.json if nothing about the object changed and only the formatting. Thereby erasing
the unwanted forced formatting that yarn does even when it doesn't touch the file.

Works with workspaces and single packages.

## Usage

Import it:

```shell
yarn plugin import https://raw.githubusercontent.com/HanseltimeIndustries/correct-yarn-formatting/v1.0.1/lib/index.js
```

You can change to any tag that exists on the repo to get a specific release.

## Test it out

If you want to make sure this works, first in a fully installed yarn project (without this plugin), go ahead and make a formatting change to your package.json.

`yarn`

Notice that the `package.json` has its formatting changed even though there were no actual new changes to the json object.

Now add in this plugin, make the formatting change again and run `yarn`.

You should see that no formatting changes took place and the following log:

```shell
[correct-yarn-formatting] Resetting unnecessary formatting by yarn!
        If you would like this to be a main feature please comment here: https://github.com/yarnpkg/berry/discussions/2636
```

## Log levels

Since this plugin is hopefully temporary, by default, it will print a notice any time that it has to correct an unnecessary format.
This is mainly to raise awareness about getting this to be a main feature and additionally to help you know if your yarn version still needs it.

If you would like to disable that you can set `correctFormattingLogs` in your .yarnrc:

```yaml
# No logs
correctFormattingLogs: 'none'

# All the logs
correctFormattingLogs: 'debug'

# Explicitly just the notice (default)
correctFormattingLogs: 'notice'
```

## Rationale

[Source Discussion](https://github.com/yarnpkg/berry/discussions/2636)

Currently, yarn berry reformats your `package.json` for you any time you run `yarn install`.  This includes
even when nothing has changed.  This has the undesired effect of fighting with any formatting system that you may have setup.

A tangible problem with this is that you will run into formatting tool failure checks on ci that seem like a phantom problem because
you format on your machine and then yarn quietly starts changing files during the install phase.  In my experience, this leads to lost time
debugging every new project or CI process.  Additionally, the suggested simple work arounds of `git reset --hard` may create new bugs if there
was ever some other file that got created by a plugin that we wanted.

This plugin therefore, strictly targets the `package.json` and will only reset it if the text changed after an install but the fields were the
same.

In the long term, hopefully the yarn team will provide an option so that this can no longer be needed.

# Development

[Development](./DEVELOPMENT.md)
