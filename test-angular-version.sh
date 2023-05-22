#!/usr/bin/env bash

version=$1
folder_name="test-angular-version-"

test_folder=${folder_name}${version}

mkdir ${test_folder}
cp -r src/ ${test_folder}/src
cp *.* ${test_folder}
cd ${test_folder}

node ../node_modules/.bin/ts-node change-angular-version.ts $1
yarn install
echo "TESTING AGAINST ANGULAR "${version}
yarn test:nowatch
result=$?

cd ..
rm -rf ${test_folder}
exit ${result}