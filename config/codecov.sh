#!/bin/bash
set -e

# Make the virtualenv only if the folder doesn't exist
DIR=.env
if [ ! -d "${DIR}" ]; then
  echo "Creating virtualenv (.env)"
  pip3 install virtualenv --upgrade
  # The first syntax is for CI (travis) and the OR is for MacOS catalina
  python3 -m virtualenv -p python3 .env || virtualenv -p python3 .env
fi
echo "Installing/updating requirements..."
.env/bin/pip install codecov
echo "Reporting coverage"
.env/bin/python -m codecov
