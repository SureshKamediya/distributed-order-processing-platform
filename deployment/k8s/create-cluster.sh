#!/usr/bin/env bash
set -euo pipefail

CLUSTER_NAME="distributed-order-processing-cluster"
CONFIG_FILE="$(dirname "$0")/kind-config.yaml"

# Sanity checks
command -v kind >/dev/null 2>&1 || { echo "kind is not installed. Aborting."; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "kubectl is not installed. Aborting."; exit 1; }

if kind get clusters | grep -q "^${CLUSTER_NAME}$"; then
  echo "Cluster '${CLUSTER_NAME}' already exists. Skipping creation."
else
  echo "Creating kind cluster '${CLUSTER_NAME}'..."
  kind create cluster --name "${CLUSTER_NAME}" --config "${CONFIG_FILE}"
fi

echo "Switching kubectl context to kind-${CLUSTER_NAME}..."
kubectl cluster-info --context "kind-${CLUSTER_NAME}"

echo "Nodes:"
kubectl get nodes -o wide

echo "Cluster '${CLUSTER_NAME}' is ready."

echo "Installing NGINX Ingress..."

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

echo "\n-----------------------------------------------------\n"

echo "Waiting for NGINX Ingress to be ready..."

sleep 10

kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=180s

echo "\n-----------------------------------------------------\n"

echo "Happy Sailing!"