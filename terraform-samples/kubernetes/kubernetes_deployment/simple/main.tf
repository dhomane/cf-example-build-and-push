# Summary: A Kubernetes deployment

# Documentation: https://www.terraform.io/docs/language/settings/index.html
terraform {
  required_version = ">= 1.0.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

# Documentation: https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs/resources/deployment
resource "kubernetes_deployment" "terraform-k8s" {
  metadata {
    name = "terraform-k8s"
    labels = {
      app = "terraform-k8s"
    }
  }

  spec {
    replicas = 1
    selector {
      match_labels = {
        app = "terraform-k8s"
      }
    }
    template {
      metadata {
        labels = {
          app = "terraform-k8s"
        }
      }
      spec {
        container {
          image = "busybox"
          name  = "busybox"
        }
      }
    }
  }
}
