#!/usr/bin/env bash

if [ "$SAUCE_ACCESS_KEY" != "" ]; then
    ./node_modules/.bin/karma start
else
 echo "WARNING: No SauceLabs key found. Skipping browser tests."
fi