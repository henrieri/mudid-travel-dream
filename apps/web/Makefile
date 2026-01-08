# Travel Dream - Quick Deploy Commands
# Usage: make deploy

REGISTRY := 192.168.1.158:5000
IMAGE := travel-dream
TAG := latest
KUBECONFIG := /home/henri/.kube/mudid-k3s.yaml
NAMESPACE := travel-dream
HOST := travel.mudid

.PHONY: build push apply restart rollout health deploy quick

# Build Docker image
build:
	docker build -f .docker/Dockerfile -t $(REGISTRY)/$(IMAGE):$(TAG) .

# Push to registry
push:
	docker push $(REGISTRY)/$(IMAGE):$(TAG)

# Apply k8s manifests
apply:
	KUBECONFIG=$(KUBECONFIG) kubectl apply -k k8s

# Restart deployment
restart:
	KUBECONFIG=$(KUBECONFIG) kubectl -n $(NAMESPACE) rollout restart deployment $(IMAGE)

# Wait for rollout
rollout:
	KUBECONFIG=$(KUBECONFIG) kubectl -n $(NAMESPACE) rollout status deployment $(IMAGE) --timeout=120s

# Health check
health:
	@curl -s -o /dev/null -w "HTTP %{http_code}\n" -H "Host: $(HOST)" http://192.168.1.158/health

# Full deploy: build, push, apply, restart, rollout, health
deploy: build push apply restart rollout health
	@echo "Deployed successfully to http://$(HOST)"

# Quick deploy: build, push, restart (skip apply if no k8s changes)
quick: build push restart rollout health
	@echo "Quick deployed to http://$(HOST)"

# Dev server
dev:
	pnpm dev

# Production build (local)
build-local:
	pnpm build

# View logs
logs:
	KUBECONFIG=$(KUBECONFIG) kubectl -n $(NAMESPACE) logs -f deployment/$(IMAGE)

# Get pod status
status:
	KUBECONFIG=$(KUBECONFIG) kubectl -n $(NAMESPACE) get pods

# Describe deployment
describe:
	KUBECONFIG=$(KUBECONFIG) kubectl -n $(NAMESPACE) describe deployment $(IMAGE)
