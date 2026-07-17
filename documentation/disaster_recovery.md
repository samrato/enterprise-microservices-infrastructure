# Disaster Recovery Plan (DRP)

This document details the disaster recovery plan for the Enterprise Microservices Platform, targeting high resilience, minimum data loss, and short recovery times.

## 1. RTO & RPO Targets
* **Recovery Time Objective (RTO)**: `< 4 Hours` (Time taken to restore cluster operation in a new region or from backup).
* **Recovery Point Objective (RPO)**: `< 1 Hour` (Maximum age of data that can be lost during an outage).

## 2. Kubernetes Backup Strategy: Velero
Velero is the primary tool for backing up cluster manifests, persistent volumes, and configuration state.

### Velero Architecture in AWS
* Backups are scheduled and shipped to an **encrypted AWS S3 bucket** in a separate secondary AWS region (e.g., `us-west-2` for a `us-east-1` deployment).
* Backup storage location details are encrypted in transit and at rest using AWS KMS.

### Automated Velero Schedules
Apply the following cron schedules within the cluster:
* **Hourly backup (stateful resources only)**:
  `velero backup-schedule create stateful-hourly --schedule="0 * * * *" --include-namespaces production,monitoring --ttl 72h`
* **Daily backup (full cluster state)**:
  `velero backup-schedule create cluster-daily --schedule="0 2 * * *" --ttl 720h`

### Velero Recovery Execution
In the event of cluster loss:
1. Initialize the new target cluster using Terraform: `terraform apply`.
2. Install Velero CLI pointing to the backup S3 bucket credentials.
3. Query active backups: `velero backup get`.
4. Restore application resources:
   `velero restore create --from-backup cluster-daily-2026xxxx --include-namespaces production`

## 3. Database Recovery: Multi-AZ RDS PostgreSQL
* **Replication**: Active Multi-AZ replication ensures immediate synchronous standby failover within seconds (RTO < 60 seconds for single-zone outages) without data loss (RPO = 0).
* **Cross-Region Read Replicas**: Provisioned in secondary region to serve as cold recovery targets for full regional disasters.
* **Database Backups**:
  * Automated RDS daily snapshot kept for 35 days.
  * Snapshots are copied automatically to the recovery region (`us-west-2`).

## 4. Multi-Region Failover Plan
In the event of a total AWS Region outage:
1. **DNS Switch**: Lower Route53 TTL to 60s, modify record routes from the primary region load balancer to the secondary region ALB.
2. **Database Promotion**: Promote the RDS cross-region read replica in `us-west-2` to Primary.
3. **GitOps Sync**: Point ArgoCD to the secondary region EKS cluster. Apply the production configurations.
4. **Smoke Testing**: Verify application liveness and DB connectivity. Update global traffic indicators.
