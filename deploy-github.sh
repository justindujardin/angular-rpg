#!/bin/bash
rm -rf out || exit 0;
mkdir out;
( echo "Building gh-pages repo"
 cp -a bower_components out
 cp -a entities out
 cp -a fonts out
 cp -a images out
 cp -a maps out
 cp -a music out
 cp -a sounds out
 cp -a source out
 cp -a typings out
 cp -a vendor out
 cp -a index.html out/
 cp -a README.md out/
 cp -a LICENSE out/
 cd out
 git init
 git config user.name "pow-bot"
 git config user.email "bot@dujardinconsulting.com"
 git add .
 git commit -m "Deployed to Github Pages"
 git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
)
