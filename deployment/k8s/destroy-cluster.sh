#!/usr/bin/env bash
set -euo pipefail

CLUSTER_NAME="distributed-order-processing-cluster"

command -v kind >/dev/null 2>&1 || { echo "kind is not installed. Aborting."; exit 1; }

if ! kind get clusters | grep -q "^${CLUSTER_NAME}$"; then
  echo "Cluster '${CLUSTER_NAME}' does not exist. Nothing to do."
  exit 0
fi

read -rp "This will permanently delete cluster '${CLUSTER_NAME}'. Continue? [y/N] " confirm
if [[ "${confirm}" =~ ^[Yy]$ ]]; then
  echo "Deleting cluster '${CLUSTER_NAME}'..."
  kind delete cluster --name "${CLUSTER_NAME}"
  echo "Cluster '${CLUSTER_NAME}' deleted."
else
  echo "Aborted. Cluster left untouched."
fi