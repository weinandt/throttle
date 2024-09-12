# node-typescript-setup

A project format which can be copied for project which wish to use node, typescript, vscode, ts-node, mocha.

## Debugging in VSCode
Just open the `package.json` in vscode. You'll see debug above scripts.

Just go to debugging tab and select either the "Debug Server" or "Debug Tests"

## Updating Dependencies

Dependencies are updated inside the same docker container which will run in production.

1. `docker build --target base -t base .`
2. `docker run --rm -it -v ${PWD}:/usr/src/app base bash`
    - NOTE: You are now in the container
3. Find all outdated packages: `npm outdated`
4. Rev major versions on packages.
    - For example, to rev major version of typescript to version 5: `npm install typescript@5`
