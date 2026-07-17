variable "project_name" {
  type        = string
  description = "Project name prefix"
}

variable "subnet_ids" {
  type        = list(string)
  description = "Subnet IDs for DB Subnet Group"
}

variable "rds_sg_id" {
  type        = string
  description = "Security Group ID for RDS"
}
