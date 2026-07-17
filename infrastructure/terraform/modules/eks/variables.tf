variable "project_name" {
  type        = string
  description = "Project name prefix"
}

variable "eks_cluster_name" {
  type        = string
  description = "EKS cluster name"
}

variable "subnet_ids" {
  type        = list(string)
  description = "Private Subnet IDs to place worker nodes in"
}

variable "eks_nodes_sg_id" {
  type        = string
  description = "Security Group ID for EKS nodes"
}

variable "eks_node_instance_types" {
  type        = list(string)
  description = "Instance types for EKS nodes"
}
