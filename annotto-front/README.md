## Prerequisites

-   [NodeJS 8.10.0+](https://nodejs.org/en/)
-   [Yarn 1.12.1+](https://yarnpkg.com/fr/docs/install)


## Commands

- Install dependencies

  ```
  $ yarn install
  ```

- Runs the project:
  ```
  $ yarn start
  ```
- Runs the mock server:
  ```
  $ yarn mock
  ```

- Runs the application server:
  ```
  $ yarn serve
  ```

- Packages a deployment version of the application:
  ```
  $ yarn build
  ```

- Runs unit tests:
  ```
  $ yarn test
  ```

- Runs unit tests with coverage:
  ```
  $ yarn test --coverage
  ```

- Runs unit tests for CI purpose
  ```
  $ yarn test:ci
  ```

## Styling

The project implements [styled-components](https://www.styled-components.com/) to manage component styles.

All component folders contain a `__styles__` directory for styling files.

The style guide is defined in `src/__theme__/theme.js`:
All design facets of the application are referenced and used throughout the app by using the **ThemeProvider** component provided by **styled-components**.

## Unit tests

The project uses [jest](https://github.com/facebook/jest) as a test runner and expectation library, and [react-testing-library](https://testing-library.com/docs/react-testing-library/api) as a testing framework.
JSX tags contains as often as possible a `data-testid` attribute to retrieve the element through the DOM.
API calls are mocked with [jest-fetch-mock](https://github.com/jefflau/jest-fetch-mock).


## Mocks

A mock server is run when the app is started with the `start` script.
It allows to mock API routes by providing a custom response.
Check `mocks/index.js` to see a working example.

The mocking management uses [mockyeah](https://github.com/mockyeah/mockyeah)


## Code splitting

The project implements [redux-dynamic-modules](https://github.com/microsoft/redux-dynamic-modules) to dynamically load pages workflow (actions/reducers/sagas).
Page components are loaded using `Suspense` and `lazy` React modules.

## i18n

Localization is provided by [react-i18next](https://react.i18next.com/)

i18n is supported out of the box.

International contents are stored in `src/assets/locales`.
Keys can't be modified.

The language must be expressed with a two-chars code ("fr", "en", ...)

### Language setting

The interface language is retrieved following this order:

- .env file (using **REACT_APP_LANGUAGE** property)
- Browser language (using [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector))


##  Contributing

### Team Conventions

This application is co-maintained by all front-end developers at [La Javaness](https://www.lajavaness.com). Each contribution must follow established conventions.

We ensure consistent code formatting with [Prettier](https://prettier.io), code quality with [ESLint](https://eslint.org), and commit message formatting with [commitlint](https://commitlint.js.org).

Incoming code must not cause existing tests to fail; that rule is enforced with a precommit hook.

Code should be pushed to a ``feat/*`` or ``fix/*`` branch based on the type of change made, and a Pull Request made against the develop branch. A fellow developer must approve the PR before it can be merged.

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

## Technical overview

### Login with keycloak

- Username : `admin`
- Password : `test`

#### Admin panel setup

Visit ``localhost:8080`` in development to access keycloak admin panel.

- Username : `admin`
- Password : `admin`

To manage session time, you might consider changing the following values:
- `SSO Session Idle` (in Realm Settings/Token): default refresh token lifespan
- `SSO Session Max` in (Client/clientName/Settings - advanced settings): session max time
- `Access Token Lifespan`: lifespan of `token` used for request authentication.

For security purpose, it is advised to keep `Access Token Lifespan` short and rotate it with the `refreshToken`.
`refreshToken` value is bound to the lowest of the two values `SSO Session Idle` and `SSO Session Max`. [Check stackoverflow for further details](https://stackoverflow.com/a/67624190 )

You should note that user is logged out when `refreshToken` is outdated.

To allow session to be persisted, you have to enable ``remember me`` in `Realm Settings/Login`

#### Config files

Keycloak is initiated thanks to `keycloakConfig` object. Default `clientId` and `realm` are `annotto` . You can update these values in a `.env` file.

Please note that the param `url` has to be the exact same one as the one setup on the backend.

For more config options, please check [keycloak.js adapter documentation]([https://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter](https://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter)).

### API and Keycloak urls

> **Important**

By default, our [Docker image](https://hub.docker.com/r/ljnrepo/annotto-front) is built without setting the url of the API and Keycloak.  
That means if you want to use them on your own server, API must be accessible at `<window.location.origin>/api` and Keycloak at `<window.location.origin>/auth`.

If you plan to deploy those services elsewhere, you'll have to set the base urls and optional routes in your environment variables and rebuild the front with them.

#### Environment Variables

| Variable                 | Description                                                               |
|--------------------------|---------------------------------------------------------------------------|
| REACT_APP_BASE_URL       | Origin from where the API is accessible (E.g. "http://localhost:5001")    |
| REACT_APP_API_ROUTE      | Optional route from the origin where the API is installed (E.g. "/api")   |
| REACT_APP_KEYCLOAK_URL   | Origin from where Keycloak is accessible (E.g. "http://localhost:8080")   |
| REACT_APP_KEYCLOAK_ROUTE | Optional route from the origin where Keycloak is installed (E.g. "/auth") |

