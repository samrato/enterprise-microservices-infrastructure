# High Availability (HA) & Scaling Strategy

This document outlines the architecture for supporting enterprise-grade scaling and 99.99% availability of microservices on AWS EKS.

## 1. High Availability (HA) Cluster Topology
* **Multi-AZ Deployments**: Nodes are provisioned across 3 AWS Availability Zones (`us-east-1a`, `us-east-1b`, `us-east-1c`).
* **Pod Anti-Affinity**: Configured to ensure replicas of the same service (e.g. `user-service`) are scheduled on different physical nodes and AZs, protecting against single-node and single-AZ hardware failures.
* **Control Plane HA**: AWS EKS manages control plane nodes across multiple AZs automatically.

## 2. Dynamic Scaling Strategy
The cluster scales horizontally at both the Pod and Node level.

### Horizontal Pod Autoscaler (HPA)
Deployments are governed by HPAs tracking CPU and Memory metrics:
* **Trigger**: Scaled when CPU utilization exceeds 80% or Memory exceeds 85%.
* **Cooldown**: Scaled down slowly (5-minute cooldown period) to prevent thrashing.
* **Range**: Scale from a base replica count of 3 up to 10 pods.

### Cluster Autoscaler (CA) or AWS Karpenter
* When HPAs scale pods beyond node capacity, pods enter a `Pending` state due to lack of resources.
* The EKS Cluster Autoscaler (or Karpenter) detects these pods and provisions additional EC2 worker nodes in the private subnets.
* Scales down unused nodes after 10 minutes of inactivity to minimize costs.

## 3. Pod Disruption Budgets (PDB)
* PDBs enforce that a minimum of 2 pods must remain operational during voluntary disruptions (such as node upgrades, drainings, and resizing).
* Ensures zero-downtime maintenance operations for SRE teams.

## 4. Advanced Deployments
* **Blue/Green Deployments**: Handled via ArgoCD by updating target revisions in git and routing traffic through ingress swaps.
* **Canary Deployments**: Supported via **Argo Rollouts** (or Nginx Ingress annotations for weighted routing) to direct a percentage of traffic (e.g., 5%, 20%, 100%) to the canary pods before completing full rollouts.
