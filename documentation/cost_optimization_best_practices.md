# Cost Optimization & Production Best Practices

This document outlines strategies to optimize operational expenditure (OpEx) while maintaining performance and reliability.

## 1. Cost Optimization Recommendations

### AWS Spot Instances for Worker Nodes
* **Worker Node Strategy**: Use EC2 Spot Instances for non-critical workloads or dynamic scaling pods. Save up to 90% compared to On-Demand prices.
* **Mixed Instance Groups**: Use AWS Node Groups containing a mix of On-Demand instances (for base load, e.g. 3 base nodes) and Spot Instances (for autoscaling).

### NAT Gateway Consolidation
* **Strategy**: During initial staging and development, deploy a single NAT Gateway shared across AZs instead of one NAT Gateway per AZ. This reduces base charges by 66%.
* **VPC Endpoints**: Configure Gateway VPC Endpoints (free) for **S3** and **DynamoDB** and Interface VPC Endpoints for **ECR** so that internal container traffic does not incur NAT Gateway data processing charges.

### Resource Request & Limit Tuning
* **Right-Sizing**: Analyze resource usage via Prometheus metrics. Set requests close to average consumption and limits to 95th percentile consumption.
* **Under-Allocated Containers**: Use Vertical Pod Autoscaler (VPA) in recommendation mode to identify over-provisioned pods and reduce resource requests, maximizing node utilization.

### S3 Lifecycle Rules
* **Loki and Velero Backups**: Apply lifecycle policies on the backup S3 buckets:
  * Move backups from standard S3 to **S3 Glacier Instant Retrieval** after 30 days.
  * Delete backups permanently after 90 days.

---

## 2. Production SRE Best Practices Checklist
- [ ] **Infrastructure as Code (IaC)**: No manual changes in the AWS Console. Everything must be applied via Terraform.
- [ ] **Centralized Logging**: Loki/Promtail config running on all nodes with log rotation limits.
- [ ] **Grafana Alerting**: Active Slack & Email alerts configured for memory pressure, container crashes, and disk usage.
- [ ] **Rolling Updates**: Ensure `maxSurge` and `maxUnavailable` are defined on all production deployments to guarantee zero downtime.
- [ ] **Pod Security**: Ensure Kyverno or OPA gatekeeper blocks privileged pods.
- [ ] **Database Integrity**: DB backups tested and verified monthly. Read-replicas checked for replication lag.
