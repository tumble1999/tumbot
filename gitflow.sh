#!/bin/bash

echo "stable
unstable
feature/
bugfix/
release/
hotfix/
support/
v." | git flow init $*
