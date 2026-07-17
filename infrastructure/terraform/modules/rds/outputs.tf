output "db_endpoint" {
  description = "The connection endpoint for the RDS PostgreSQL DB"
  value       = aws_db_instance.postgres.endpoint
}
