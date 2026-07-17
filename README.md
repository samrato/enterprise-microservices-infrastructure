# 🌐 Enterprise-Grade Microservices CI/CD Infrastructure Platform

Welcome to the **Enterprise-Grade Microservices Deployment Infrastructure**. This repository implements a production-ready, highly available, secure, and GitOps-synchronized platform on AWS using Kubernetes, Terraform, ArgoCD, and Jenkins. 

The platform supports a microservices application consisting of **4 Golang backends** and a **Vite React frontend**, managed under Zero-Trust Network Policies, Horizontal Pod Autoscaling (HPA), central logging, and comprehensive SRE monitoring.

---

## 📂 Repository Structure

Below is the layout of the project, separating infrastructure definition, application service logic, pipeline instructions, and Kubernetes manifests:

```text
enterprise-microservices-infrastructure/
├── .github/workflows/                      # GitHub Actions CI/CD workflows
│   ├── terraform-ci.yml                    # Automated Terraform Plan validation
│   └── ci-cd-pipeline.yml                  # 18-stage CI/CD pipeline workflow
│
├── services/                               # Application Microservices
│   ├── frontend/                           # React frontend with Vite & non-root Nginx Server
│   │   ├── src/                            # App code & styling
│   │   ├── Dockerfile                      # Multi-stage Docker build
│   │   └── nginx.conf                      # Non-root secure server config
│   ├── user-service/                       # Go user microservice (Port 8081)
│   ├── auth-service/                       # Go authentication microservice (Port 8082)
│   ├── payment-service/                    # Go payment microservice (Port 8083)
│   └── notification-service/               # Go notification microservice (Port 8084)
│
├── infrastructure/                         # Infrastructure as Code (IaC)
│   └── terraform/                          # AWS Provisioning Modules
│       ├── main.tf                         # Root config calling submodules
│       ├── variables.tf                    # Root input variables
│       ├── outputs.tf                      # Root output variables
│       └── modules/                        # Reusable modular components
│           ├── vpc/                        # VPC subnets & NAT Gateways
│           ├── security_groups/            # Port filter definitions (ALB/Node/DB)
│           ├── eks/                        # EKS Cluster Control Plane & Node Groups
│           ├── rds/                        # Multi-AZ RDS PostgreSQL
│           └── acm_route53/                # ACM Certificate & Route53 Setup
│
├── kubernetes/                             # GitOps-managed Manifests
│   ├── namespaces/                         # Production, staging, monitoring namespaces
│   ├── deployments/                        # Pod configurations & HA settings
│   ├── services/                           # Internal ClusterIP network routing
│   ├── ingress/                            # Nginx Ingress SSL rules
│   ├── configmaps/                         # App environment configurations
│   ├── secrets/                            # Encrypted sensitive credentials template
│   ├── policies/                           # Zero-Trust NetworkPolicies & RBAC
│   ├── storage/                            # AWS EBS gp3 StorageClasses & PVCs
│   ├── monitoring/                         # Prometheus, Grafana, Alertmanager & Loki configs
│   └── gitops/                             # ArgoCD Applications for GitOps Sync
│
├── jenkins/                                # Continuous Integration (CI)
│   └── Jenkinsfile                         # Declarative 18-stage pipeline
│
├── docker/                                 # Local Orchestration
│   └── docker-compose.yml                  # Local development compose configuration
│
└── documentation/                          # System Architecture & Design
    ├── system_architecture.md               # High-Level, AWS, K8s & Net Diagrams
    ├── disaster_recovery.md                # Velero Backups, RTO/RPO & Failovers
    ├── security_architecture.md            # Container security, Encryption & scans
    ├── scaling_ha_strategies.md            # Autoscaling, PDBs & Canary Rollouts
    └── cost_optimization_best_practices.md # Cost Recommendations & SRE Checklist
```

---

## 🛠️ Infrastructure Architecture (AWS & EKS)

The infrastructure is built on AWS following the **AWS Well-Architected Framework**:

1. **Networking**: Custom VPC (`10.0.0.0/16`) spanning 3 Availability Zones with public subnets (ALBs & NAT Gateways) and private subnets (EKS Worker Nodes & databases).
2. **Compute**: Highly available EKS Cluster with three managed worker nodes running in private subnets. Node groups are set to scale from 3 to 6 instances using EKS Cluster Autoscaler.
3. **Database**: Multi-AZ RDS PostgreSQL database instance configured for synchronous replication and automatic failover. Access is restricted exclusively to EKS worker node security groups.
4. **Security**: SSL termination at the ALB managed via AWS Certificate Manager (ACM) and resolved through Route53 DNS zones.

---

## 🚀 CI/CD Pipeline (Jenkinsfile 18-Stage Execution)

The Jenkins pipeline ([jenkins/Jenkinsfile](file:///home/activator/Projects/devops/enterprise-microservices-infrastructure/jenkins/Jenkinsfile)) executes the following stages:

| Stage | Process Name | Description |
|---|---|---|
| **1** | **Checkout Source Code** | Clones code from Git repository. |
| **2** | **Install Dependencies** | Parallel npm installation for frontend & `go mod download` for backends. |
| **3** | **Run Unit Tests** | Executes Go test suites and React test scripts. |
| **4** | **Run Integration Tests** | Verifies backend compatibility with mock database connections. |
| **5** | **SonarQube Scan** | Runs static analysis to measure code quality and detect hotspots. |
| **6** | **Dependency Scan** | Scans external libraries for security vulnerabilities. |
| **7** | **Build Go Services** | Compiles statically linked Go binaries for all 4 microservices. |
| **8** | **Build React Application** | Compiles Vite React assets into static files. |
| **9** | **Build Docker Images** | Builds lightweight, non-root multi-stage Docker images. |
| **10** | **Trivy Image Scan** | Scans container image layers for CVEs (rejects on High/Critical). |
| **11** | **Push Private Registry** | Uploads stable build artifacts to private Nexus repository. |
| **12** | **Push Docker Hub** | Pushes public release images to Docker Hub registry. |
| **13** | **Deploy to EKS** | Dynamically updates deployment manifests with tags and applies changes. |
| **14** | **Verify Rollout** | Monitors `kubectl rollout status` ensuring zero-downtime execution. |
| **15** | **Smoke Tests** | Hits ingress endpoints, ensuring HTTP 200 responses. |
| **16** | **Automatic Rollback** | Triggers `kubectl rollout undo` if deployment verification fails. |
| **17** | **Email Notifications** | Reports pipeline success or failure details to SRE teams. |
| **18** | **Slack Notifications** | Emits interactive channel alerts regarding build progress. |

---

## ⚙️ How to Run Locally

For local development and testing, run the entire stack using Docker Compose:

### 1. Build and Start Services
From the root of the repository, execute:
```bash
docker-compose -f docker/docker-compose.yml up --build -d
```

### 2. Verify Port Mapping
Once containers are healthy:
* **Frontend Console**: [http://localhost:3000](http://localhost:3000)
* **User Service API**: [http://localhost:8081/api/v1/users](http://localhost:8081/api/v1/users)
* **Auth Service API**: [http://localhost:8082/healthz](http://localhost:8082/healthz)
* **Payment Service API**: [http://localhost:8083/healthz](http://localhost:8083/healthz)
* **Notification Service API**: [http://localhost:8084/healthz](http://localhost:8084/healthz)

---

## 📈 Monitoring & Logging Architecture

Central monitoring is configured in the `monitoring` namespace using:
* **Prometheus**: Scrapes node exporter, cAdvisor container metrics, and Kubernetes internal metrics.
* **Grafana**: Dashboards configured with Prometheus and Loki data sources (`AdminGrafanaSecure123`).
* **Alertmanager**: Sends real-time warning logs to SRE Slack channels and support emails.
* **Loki & Promtail**: DaemonSet collects container logs from node file systems and ships them to Loki for storage.

---

## 📄 Key Infrastructure Declarations

- **Terraform Modules**: [infrastructure/terraform/](file:///home/activator/Projects/devops/enterprise-microservices-infrastructure/infrastructure/terraform/)
- **Kubernetes Deployments**: [kubernetes/deployments/](file:///home/activator/Projects/devops/enterprise-microservices-infrastructure/kubernetes/deployments/)
- **Network Policies**: [kubernetes/policies/network-policies.yaml](file:///home/activator/Projects/devops/enterprise-microservices-infrastructure/kubernetes/policies/network-policies.yaml)
- **Central Logging (Loki/Promtail)**: [kubernetes/monitoring/loki-promtail.yaml](file:///home/activator/Projects/devops/enterprise-microservices-infrastructure/kubernetes/monitoring/loki-promtail.yaml)
- **GitHub Actions Workflows**: [.github/workflows/](file:///home/activator/Projects/devops/enterprise-microservices-infrastructure/.github/workflows/)
