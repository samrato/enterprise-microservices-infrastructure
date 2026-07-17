# Database Subnet Group in Private Subnets
resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# DB Parameter Group
resource "aws_db_parameter_group" "db_params" {
  name   = "${var.project_name}-db-params"
  family = "postgres15"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }

  tags = {
    Name = "${var.project_name}-db-params"
  }
}

# Highly Available Multi-AZ RDS Postgres DB for production storage
resource "aws_db_instance" "postgres" {
  identifier             = "${var.project_name}-db"
  allocated_storage      = 20
  max_allocated_storage  = 100
  db_name                = "enterprisedb"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.t3.medium"
  username               = "dbadmin"
  password               = "VaultManagedPasswordSecure123"
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [var.rds_sg_id]
  parameter_group_name   = aws_db_parameter_group.db_params.name
  multi_az               = true
  skip_final_snapshot    = true
  storage_encrypted      = true
  deletion_protection    = false

  tags = {
    Name = "${var.project_name}-db-postgres"
  }
}
