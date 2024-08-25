resource "aws_instance" "database" {
  ami                         = "ami-0c28dbbd4ed200038"
  instance_type               = "t4g.small"
  subnet_id                   = aws_subnet.private_1.id
  key_name                    = "skku-royals-key-pair"
  vpc_security_group_ids      = [aws_security_group.ec2.id, data.aws_security_group.ssh-allow.id]
  associate_public_ip_address = true

  root_block_device {
    volume_size           = 50
    volume_type           = "gp3"
    delete_on_termination = true
  }

  user_data = templatefile("${path.module}/postgres-docker.sh.tpl", { postgres_password = var.postgres_password })

  tags = {
    Name = "PostgrSQL EC2 Instance"
  }
}

resource "aws_instance" "cache" {
  ami                         = "ami-0c28dbbd4ed200038"
  instance_type               = "t4g.micro"
  subnet_id                   = aws_subnet.private_2.id
  key_name                    = "royals-ecs-redis-keypair"
  vpc_security_group_ids      = [aws_security_group.ec2.id, data.aws_security_group.ssh-allow.id]
  associate_public_ip_address = true

  root_block_device {
    volume_size           = 30
    volume_type           = "gp3"
    delete_on_termination = true
  }

  user_data = templatefile("${path.module}/redis-docker.sh.tpl", {})

  tags = {
    Name = "Redis EC2 Instance"
  }
}
