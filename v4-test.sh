#!/usr/bin/env bash

mkdir v4-test
cp -r src/ v4-test/src
cp *.* v4-test
cd v4-test

node ../node_modules/.bin/ts-node change-angular-version.ts 4.4.7
yarn install
yarn test
result=$?

cd ..
rm -rf v4-test
exit ${result}