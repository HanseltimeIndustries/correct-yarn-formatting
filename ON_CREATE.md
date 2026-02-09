# On Creation of your repo from the base template

**Note: please keep this file in your repo so that when new template syncs occur you can see if you need to make any retro-active changes**

Thanks for choosing this [Github Actions repo template](https://github.com/HanseltimeIndustries/github-actions-template.git)! This hopefully
helps create a standard boilerplate for github actions that enforces things like:

- Linting and testing patterns
- Typescript as a first class citizen
- Semantic Versioning and major version tagging
- CI/CD standarddized integrations

## Getting Started

There are a few things that you need to change from this template:

### [package.json](./package.json)

- `name: <your package name>`
- `description: <your description>`
- `repository: <Your github url>`
- `bugs: <your github issues url>`
- `hompage: <your homepage url>`
- `author: <your author name>`

### [action.yml](./action.yml)

This yaml is something you need to set up completely based on the
[github javascript action development documentation](https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-javascript-action).

The only thing that you will probably not need to change is the `runs.main` entry since typescript is set up to generate and
commit back that file during the build phase.

### Github configuration

**TODO: it would be nice to provide a pulumi set of IAC to configure the github repo completely**

Because template repositories cannot carry their permissions configuration, you will need to set up a few extra pieces to your Github repository.
Please note, that you should still check other policies, but these are a minimum set of requirements.

#### Auto-commit Github Application

Because of the way that we have to compile our application to `index.js` and we need to commit some additional changes via semantic-release, we need
to be able to write back onto the deploy branch as part of our release process. In order to do this, we heavily recommend using a Github Application
with the appropriate permissions (in fact, that is how the deploy.yaml is currently set up).

You will need a Github application that has:

- Repository Contents - read + write
- Metadata - read-only

For setting this up, you will want to be an Organization Admin and
[create a simple private github application](https://docs.github.com/en/apps/creating-github-apps).  
Once you have done that, you will want to install the application in your organization and (recommended) limit the repositories for that application.

Once you have the application, you will want to generate a private key and then copy that private key into an agreed upon Github Secret value and then
delete the private key from any other locations.

##### About Security posture for Github Application key

At the most naive, you can create an agreed upon organization secret for the private key with something like "private" or "all". This type of position,
while not insecure, is also subject to you trusting that maintainers do not allow malicious github actions into the repo that could try to acquire that
private key and that all maintainers across your entire organization are good actors.

1. Limiting repositories

   The simplest way to limit the scope of this primary key exposure is to change its visibility to only the repos that you specify instead of the mass private/all.

   If this is your set up, you will need to add this new repo as an allowed repo to the secret.

2. Using environments

   Depending on your Github pricing tier and the public/private nature of your repos, you may find it easier to create a Github Environment and update your workflow to use that environment. You can restrict your github environment to only deploy on agreed upon branches, and therefore restrict this
   key to the release flow on its release branches.

3. An app per action

   The 2 preceding options deal with restricting exposure of a private key that might be re-used across diffferent actions repos. A way to minimize the
   concern about this leaking would be to create multiple applications, with the most aggressive strategy for this approach being to make a separate
   github application for every repo that needs to release.

All the strategies listed above depend on your team's security tolerances.

\_\_For your template, regardless of strategy, please update the app_id and private key in [release.yaml](./.github/workflows/release.yaml) to match the
correct secrets with the App Id and corresponding Private Key of the application.

#### Repository Rule Sets

Now that we have our special auto-commit application set up, we can set up protections on this repository to ensure that only the auto-commit application
can perform direct actions on release branches.

- Create a rule set in the repo settings
- Set the branches to:
  - main - for actual release
  - alpha - for alpha channel release
- Add a "bypass exception" for the application that you just specified in the workflow file
- Ensure status checks are required
  - You will have to run your statuses once to add them
  - At the very least, you will want to add:
    - no-committed-bundle
    - ci-checks
- Add additional checks that you would like
