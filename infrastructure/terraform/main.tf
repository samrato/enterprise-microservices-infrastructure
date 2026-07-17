terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "Terraform"
    }
  }
}

# 1. VPC Network Module
module "vpc" {
  source               = "./modules/vpc"
  project_name         = var.project_name
  eks_cluster_name     = var.eks_cluster_name
  vpc_cidr             = var.vpc_cidr
  availability_zones   = var.availability_zones
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

# 2. Security Groups Module
module "security_groups" {
  source       = "./modules/security_groups"
  project_name = var.project_name
  vpc_id       = module.vpc.vpc_id
  vpc_cidr     = var.vpc_cidr
}

# 3. EKS Cluster Module
module "eks" {
  source                  = "./modules/eks"
  project_name            = var.project_name
  eks_cluster_name        = var.eks_cluster_name
  subnet_ids              = module.vpc.private_subnet_ids
  eks_nodes_sg_id         = module.security_groups.eks_nodes_sg_id
  eks_node_instance_types = var.eks_node_instance_types
}

# 4. RDS PostgreSQL Module
module "rds" {
  source       = "./modules/rds"
  project_name = var.project_name
  subnet_ids   = module.vpc.private_subnet_ids
  rds_sg_id    = module.security_groups.rds_sg_id
}

# 5. DNS and ACM Module
module "acm_route53" {
  source       = "./modules/acm_route53"
  project_name = var.project_name
  domain_name  = var.domain_name
}
