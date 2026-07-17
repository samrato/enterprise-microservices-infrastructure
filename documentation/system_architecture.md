# Enterprise System Architecture & Diagrams

This document contains high-fidelity design specifications and architectural diagrams for the Enterprise Microservices Platform.

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    User([End Users]) -->|HTTPS| Ingress[NGINX Ingress Controller]
    
    subgraph Kubernetes Cluster
        Ingress -->|Route /| Frontend[React Frontend Pods]
        Ingress -->|Route /api/v1/users| UserService[User Service Pods]
        Ingress -->|Route /api/v1/auth| AuthService[Auth Service Pods]
        Ingress -->|Route /api/v1/payments| PaymentService[Payment Service Pods]
        Ingress -->|Route /api/v1/notifications| NotificationService[Notification Service Pods]
    end

    subgraph AWS Managed Infrastructure
        UserService -->|Queries| RDS[(PostgreSQL Multi-AZ)]
        AuthService -->|Credentials/Tokens| RDS
        PaymentService -->|Transactions| RDS
        NotificationService -->|Log events| RDS
    end
    
    subgraph Developer Tools
        Jenkins[Jenkins CI/CD] -->|Pushes Images| Nexus[(Nexus Repository)]
        Jenkins -->|Pushes Public| DockerHub[(Docker Hub)]
        ArgoCD[ArgoCD GitOps] -->|Syncs YAMLs| Kubernetes[K8s ApiServer]
    end
```

---

## 2. AWS Infrastructure Diagram

```mermaid
graph TD
    subgraph VPC ["AWS VPC (10.0.0.0/16)"]
        IGW[Internet Gateway]
        
        subgraph PublicSubnets ["Public Subnets (ALB & NAT)"]
            ALB[Application Load Balancer]
            NAT[NAT Gateway]
        end
        
        subgraph PrivateSubnets ["Private Subnets (EKS Worker Nodes & RDS)"]
            subgraph EKS ["EKS Cluster Control Plane"]
                Worker1[Worker Node 1]
                Worker2[Worker Node 2]
                Worker3[Worker Node 3]
            end
            
            subgraph DBSubnets ["DB Subnet Group"]
                RDS_Primary[(RDS Postgres Primary - AZ-A)]
                RDS_Standby[(RDS Postgres Standby - AZ-B)]
            end
        end
    end
    
    Internet([Internet]) -->|DNS Route53 / SSL ACM| IGW
    IGW --> ALB
    ALB -->|Forward HTTPS| Worker1 & Worker2 & Worker3
    Worker1 & Worker2 & Worker3 -->|NAT Egress| NAT
    NAT --> IGW
    Worker1 & Worker2 & Worker3 -->|Read/Write| RDS_Primary
    RDS_Primary -->|Replication| RDS_Standby
```

---

## 3. Kubernetes Architecture Diagram

```mermaid
graph TB
    subgraph Kubernetes Cluster ["Kubernetes Cluster Nodes"]
        subgraph ControlPlane ["Master Control Plane"]
            ApiServer[kube-apiserver]
            Etcd[(etcd)]
            Scheduler[kube-scheduler]
            ControllerManager[kube-controller-manager]
        end

        subgraph Node1 ["Worker Node 1"]
            Kubelet1[Kubelet]
            KProxy1[Kube-Proxy]
            PodF1[Frontend Pod]
            PodU1[User Service Pod]
        end

        subgraph Node2 ["Worker Node 2"]
            Kubelet2[Kubelet]
            KProxy2[Kube-Proxy]
            PodA1[Auth Service Pod]
            PodP1[Payment Service Pod]
        end

        subgraph Node3 ["Worker Node 3"]
            Kubelet3[Kubelet]
            KProxy3[Kube-Proxy]
            PodN1[Notification Service Pod]
            PodF2[Frontend Pod (Replica)]
        end
    end

    ApiServer --> Etcd
    Scheduler --> ApiServer
    ControllerManager --> ApiServer
    Kubelet1 --> ApiServer
    Kubelet2 --> ApiServer
    Kubelet3 --> ApiServer
```

---

## 4. Networking Diagram (Ingress & Namespace Isolation)

```mermaid
graph LR
    subgraph External
        Client([Client Browser])
    end

    subgraph IngressNamespace ["Namespace: ingress-nginx"]
        IngressController[NGINX Ingress Controller]
    end

    subgraph ProductionNamespace ["Namespace: production (Zero-Trust NetworkPolicies)"]
        Frontend[React Frontend]
        UserService[User Service]
        AuthService[Auth Service]
        PaymentService[Payment Service]
        NotificationService[Notification Service]
    end

    Client -->|HTTPS Port 443| IngressController
    IngressController -->|HTTP Port 8080| Frontend
    IngressController -->|HTTP Port 8081| UserService
    IngressController -->|HTTP Port 8082| AuthService
    IngressController -->|HTTP Port 8083| PaymentService
    IngressController -->|HTTP Port 8084| NotificationService

    Frontend -.->|Block Direct Pod Traffic| UserService
    UserService -.->|Egress Blocked Except DNS/RDS| External
    PaymentService -->|Port 5432| RDS[(AWS RDS Database)]
```

---

## 5. CI/CD Pipeline Flow Diagram (Jenkins 18 Stages)

```mermaid
stateDiagram-v2
    [*] --> CheckoutSourceCode : 1. Checkout
    CheckoutSourceCode --> InstallDependencies : 2. Install Deps
    InstallDependencies --> RunUnitTests : 3. Unit Tests
    RunUnitTests --> RunIntegrationTests : 4. Integration Tests
    RunIntegrationTests --> StaticCodeAnalysis : 5. SonarQube Scan
    StaticCodeAnalysis --> DependencyScan : 6. Vulnerability Scan
    DependencyScan --> BuildGoServices : 7. Build Go APIs
    BuildGoServices --> BuildReactApp : 8. Build Frontend
    BuildReactApp --> BuildDockerImages : 9. Build Images
    BuildDockerImages --> ScanDockerImages : 10. Trivy Scan
    ScanDockerImages --> PushNexus : 11. Push Nexus
    PushNexus --> PushDockerHub : 12. Push DockerHub
    PushDockerHub --> DeployKubernetes : 13. Deploy to EKS
    DeployKubernetes --> VerifyDeployment : 14. Verify Rollout
    VerifyDeployment --> SmokeTests : 15. Smoke Tests
    
    state DeploymentStatus <<choice>>
    SmokeTests --> DeploymentStatus
    
    DeploymentStatus --> NotifySuccess : Success
    DeploymentStatus --> RollbackDeployment : Failure (Smoke test failed)
    
    RollbackDeployment --> 16._Rollback_Active
    16._Rollback_Active --> NotifyFailure
    
    NotifySuccess --> [*] : 17/18. Slack/Email (Success)
    NotifyFailure --> [*] : 17/18. Slack/Email (Failure)
```
