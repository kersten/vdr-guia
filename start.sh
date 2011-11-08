#!/usr/bin/env sh

export NODE_PATH=\
$NODE_PATH\
:./src/models

node src/server.js
