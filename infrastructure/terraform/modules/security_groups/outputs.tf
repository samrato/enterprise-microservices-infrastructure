output "alb_sg_id" {
  description = "The ID of the ALB Security Group"
  value       = aws_security_group.alb.id
}

output "eks_nodes_sg_id" {
  description = "The ID of the EKS nodes Security Group"
  value       = aws_security_group.eks_nodes.id
}

output "rds_sg_id" {
  description = "The ID of the RDS Security Group"
  value       = aws_security_group.rds.id
}
