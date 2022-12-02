
## ![](annotto-front/public/static/images/logo_blue.png)nnotto
*produced by* [La Javaness](https://www.lajavaness.com/)

![GitHub](https://img.shields.io/github/license/lajavaness/annotto-api?logo=heartex) ![deploy](https://github.com/lajavaness/annotto-api/actions/workflows/deploy.yml/badge.svg) ![GitHub release](https://img.shields.io/github/v/release/lajavaness/annotto-api?include_prereleases)
![Dependency-Track](https://dependency-track.ops.lajavaness.com/api/v1/badge/vulns/project/6f393512-576a-46ab-8d82-a22852a1fb82Is)
[Website](https://www.lajavaness.com/annotto) • [Docs](https://lajavaness.github.io/annotto-docs/)

# Description
Annotto is the only **go to** annotation tool to successfully annotate your documents at scale.

# Table of contents
1. [Start with docker](#start-with-docker)
2. [Start for local development](#start-for-local-development)

# Start with docker
```
  docker run --rm -d --name annotto -p 3000:3000 ljnrepo/annotto:latest
```
***
**Annotto** will be available at [http://localhost:3000](http://localhost:3000) with default credentials
```
username (email): admin
password: test
```

# Start for local development
## Prerequisites
1. Node 16+
2. Mongo 4.4
3. Keycloak 15.0.1
4. PostgreSQL 13+

## Launch the app

1. Install project dependencies
```shell
yarn install
```
2. Launch environment
```shell
docker-compose up -d
```
3. Launch annotto

```shell
yarn start:dev
```

### Environment variables
| Name                         | Default                                   | Optional-Required | Description                                                          |
|------------------------------|-------------------------------------------|---------------|----------------------------------------------------------------------|
| PORT                         | 5001                                      | optional      | Server listening port                                                |
| NODE_ENV                     | development                               | optional      | NODE Environment to use "[development, test]"                        |
| ENCRYPTION_SECRET_KEY        | -                                         | optional      | A Secret Key used to encrypt AWS creds  (symmetric)                  |
| MONGO_URL                    | mongodb://localhost:27017/ljn_annotto_dev | optional      | Mongo connection string                                              |
| ANNOTTO_FRONT_URL            | http://localhost:3000                     | optional      | Annotto Front base url                                               |
| KEYCLOAK_REALM               | annotto                                   | optional      | Keycloak Realm (preconfigured if started with docker-compose_)       |
| KEYCLOAK_AUTH_URL            | http://localhost:8080/auth                | optional      | Keycloak auth url (preconfigured if started with docker-compose_)    |
| KEYCLOAK_CLIENT_ID           | annotto                                   | optional      | Keycloak client id (preconfigured if started with docker-compose_)   |
| KEYCLOAK_CLIENT_SECRET       | a7b7a29d-abb0-4e21-abec-bca99a47e40e      | optional      | Keycloak client secret (preconfigured if started with docker-compose_) |
| ANNOTTO_UPLOAD_MAX_FILE_SIZE | 1048576000                                | optional      | Max file size permitted to upload (default = 1000 * 1024 * 1024)     |
| ANNOTTO_UPLOAD_BATCH_SIZE    | 50000                                     | optional      | Max file size permitted to upload (default = 1000 * 1024 * 1024)     |

## Users and Roles
When starting Annotto, you will get 3 users preconfigured with three different role (`"admin"|"user"|"dataScientist'`)

The different default users are: 

|username|password|role|
|---|---|---|
|admin|test|admin|
|data|test|dataScientist|
|user|test|user|

See more documentation on Keycloak [here](./docs/keycloak.md)

##  Contributing

### Team Conventions

This package is co-maintained by all front-end developers at [La Javaness](https://www.lajavaness.com). Each contribution must follow established conventions.

We ensure consistent code formatting with [Prettier](https://prettier.io), code quality with [ESLint](https://eslint.org), and commit message formatting with [commitlint](https://commitlint.js.org).

Incoming code must not cause existing tests to fail; that rule is enforced with a precommit hook.

Code should be pushed to a ``feature/*`` or ``fix/*`` branch based on the type of change made, and a Pull Request made against the next branch. A fellow developer must approve the PR before it can be merged.

### Commits

#### Formatting
The project uses [semantic-release](https://semantic-release.gitbook.io/semantic-release) to upgrade, document and deploy its NPM package, and [commitlint](https://commitlint.js.org) to ensure all commit messages are understood by semantic-release.

Please read the [upstream documentation](https://semantic-release.gitbook.io/semantic-release/#commit-message-format) to understand the enforced format. Below is an excerpt for quick reference:

| Commit message                                                     | Release type             |
|:-------------------------------------------------------------------|:-------------------------|
| fix(pencil): Stop graphite breaking when too much pressure applied | Patch Release            |
| docs(README): Append a `Use graphite properly` section to README   | Patch Release            |
| refactor: Improve 'graphiteWidth' option                           | Patch Release            |
| style: Remove all semi-colons                                      | Patch Release            |
| feat(pencil): Add 'graphiteWidth' option                           | (Minor) Feature Release  |
| perf(pencil): Remove graphiteWidth option                          | (Major) Breaking Release |
| BREAKING CHANGE: The graphiteWidth option has been removed.        | (Major) Breaking Release |

Below is the meaning of the different commit prefixes:

- ``feat``: (new feature for a component or new component)
- ``fix``: (bug fix in a component)
- ``docs``: (changes to the documentation)
- ``style``: (formatting, missing semi colons, etc; no production code change)
- ``refactor``: (refactoring production code, eg. renaming a variable)
- ``test``: (adding missing tests, refactoring tests; no code change)
- ``perf``: (changes to code for performance reasons)
- ``chore``: (updating yarn tasks, CI pipelines, build scripts, etc; no code change)

#### Precommit Hooks

Both ``test:ci`` and ``prettier`` commands are run before each commit to ensure the code remains well-formatted and tested.

Ensure the `.git/hooks/pre-commit`` file is present in your repository.

The ``yarn prettier`` command used by pre-commit hooks automatically fixes style issues and stages any unstaged content into your commit, to make sure those style changes are staged. This prevents the use of partial commits. If you want to commit only part of your changed files, you can ``stash`` unstaged code before committing. This is the preferred way of doing things at La Javaness.


