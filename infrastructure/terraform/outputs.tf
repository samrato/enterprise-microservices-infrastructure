output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "The name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "The endpoint of the EKS cluster"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster control plane"
  value       = module.eks.cluster_security_group_id
}

output "rds_endpoint" {
  description = "The connection endpoint for the RDS PostgreSQL DB"
  value       = module.rds.db_endpoint
}

output "acm_certificate_arn" {
  description = "The ARN of the ACM Certificate"
  value       = module.acm_route53.acm_certificate_arn
}

output "route53_name_servers" {
  description = "Route53 Nameservers list"
  value       = module.acm_route53.route53_name_servers
}
