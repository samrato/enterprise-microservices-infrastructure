output "acm_certificate_arn" {
  description = "The ARN of the ACM Certificate"
  value       = aws_acm_certificate.cert.arn
}

output "route53_name_servers" {
  description = "Route53 Nameservers list"
  value       = aws_route53_zone.primary.name_servers
}
