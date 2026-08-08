# Distributed Order processing Platform


```
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/infra/       
kubectl apply -f k8s/apps/
kubectl apply -f k8s/monitoring/
kubectl apply -f k8s/ingress.yaml
```


## To view cluster on lens

```
kind get kubeconfig --name distributed-order-processing-cluster > /mnt/c/Users/hp/kind-distributed-order-processing.yaml
```