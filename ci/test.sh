#!/bin/bash

# Bash strict mode, see https://betterprogramming.pub/top-tips-for-writing-unsurprising-bash-scripts-9b9f4f0cc30e
# This is separate from the shebang so that it also works on windows
set -e
set -u

# Install
npm ci
# Test
npm run test