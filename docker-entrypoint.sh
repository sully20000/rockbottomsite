#!/bin/sh
set -eu

DATA_DIR="${DATA_DIR:-/app/data}"
UPLOAD_DIR="${UPLOAD_DIR:-/app/uploads}"
export DATA_DIR UPLOAD_DIR

# Railway mounts volumes as root. Create the app's writable folders and give
# them to the unprivileged node user before starting the server.
mkdir -p "$DATA_DIR" "$UPLOAD_DIR"
chown -R node:node "$DATA_DIR" "$UPLOAD_DIR"

exec su-exec node "$@"
