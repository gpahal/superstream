#!/bin/sh

if [[ `git status --porcelain` ]]; then
  echo "There are uncommitted changes. Please commit or stash them before committing"
  exit 1
else
  echo "No uncommitted changes"
  exit 0
fi
