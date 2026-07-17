# Security Architecture & DecSecOps Principles

This document defines the zero-trust security architecture implemented across AWS, Kubernetes, and the CI/CD pipeline.

## 1. Kubernetes Security Contexts (Least Privilege)
Pods are configured with strict POSIX permissions to prevent container break-out:
* **runAsNonRoot**: Restricts execution of binaries under the `root` (UID 0) user. All backend pods use UID 10001 (`appuser`), while the frontend uses UID 101 (`nginx`).
* **readOnlyRootFilesystem**: The container root filesystem is mounted as read-only. Temporary directories or caches are mounted using memory-backed `emptyDir` volumes.
* **allowPrivilegeEscalation: false**: Prevents a process from gaining more privileges than its parent process.
* **capabilities.drop: ["ALL"]**: Removes all Linux kernel capabilities.

## 2. Secrets Management (Envelope Encryption)
* **Encryption at Rest**: Kubernetes Secrets are encrypted at the etcd layer using AWS KMS-managed keys.
* **AWS Secrets Manager Integration**: Application secrets (databases, Slack tokens) are stored in AWS Secrets Manager and synced into the pods at runtime using the **Kubernetes Secrets Store CSI Driver**. This prevents plain text secrets from being committed to Git.

## 3. Network Isolation (Zero-Trust NetworkPolicies)
A default-deny Ingress and Egress network policy is applied to the `production` namespace.
* Pods can only communicate if explicitly allowed.
* Front-end pods can reach backend microservices.
* Only backend microservices can reach the RDS database port (`5432`).
* All outbound/egress internet traffic is blocked except for required external APIs (e.g. Slack Webhooks).

## 4. Container & Code Scanning (CI/CD Pipeline)
1. **SonarQube Static Analysis**: Runs during the build phase to inspect code for security hotspots, code smells, and bugs.
2. **Trivy Image Scanner**: Scans all built Docker image layers for known CVEs. Any image containing **HIGH** or **CRITICAL** vulnerabilities fails the pipeline and blocks deployment.
3. **Image Signing (Cosign)**: Builds are cryptographically signed using **Sigstore Cosign**. The EKS cluster uses **Kyverno** admission controller to block deployment of unsigned container images, protecting against supply chain attacks.
