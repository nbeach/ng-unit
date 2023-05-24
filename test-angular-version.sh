#!/usr/bin/env bash

version=$1

./node_modules/.bin/ts-node --esm change-angular-version.ts $1
yarn install
echo "TESTING AGAINST ANGULAR "${version}
yarn test:nowatch
result=$?

exit ${result}