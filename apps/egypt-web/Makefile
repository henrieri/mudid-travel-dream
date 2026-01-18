# Egypt Web - Production Deployment
# Usage: make deploy-verify (recommended for production)
#
# Features:
# - Cache busting via content hashes
# - Version metadata injection
# - Automated Playwright verification after deploy

REGISTRY := 192.168.1.207:30500
IMAGE := egypt-web
TAG := latest
KUBECONFIG := /home/henri/.kube/mudid-k3s.yaml
NAMESPACE := travel-dream
HOST := egypt.local

.PHONY: build push apply restart rollout health deploy quick version verify deploy-verify dev build-local logs status describe image-gen image-gen-batch

# Generate version.json before build
version:
	@echo "Generating version.json..."
	npx tsx scripts/generate-version.ts

# Build Docker image (from monorepo root for workspace deps)
# Includes version generation for cache busting metadata
build: version
	cd ../.. && docker build -f apps/egypt-web/.docker/Dockerfile -t $(REGISTRY)/$(IMAGE):$(TAG) .

# Push to registry
push:
	docker push $(REGISTRY)/$(IMAGE):$(TAG)

# Apply k8s manifests
apply:
	KUBECONFIG=$(KUBECONFIG) kubectl apply -k k8s

# Restart deployment (triggers pull of new image)
restart:
	KUBECONFIG=$(KUBECONFIG) kubectl -n $(NAMESPACE) rollout restart deployment $(IMAGE)

# Wait for rollout to complete
rollout:
	KUBECONFIG=$(KUBECONFIG) kubectl -n $(NAMESPACE) rollout status deployment $(IMAGE) --timeout=120s

# Basic health check (HTTP 200)
health:
	@echo "Waiting 5s for pods to be ready..."
	@sleep 5
	@echo "Checking health endpoint..."
	@curl -sf -o /dev/null -w "HTTP %{http_code} - " -H "Host: $(HOST)" http://192.168.1.207/ && echo "OK" || (echo "FAILED" && exit 1)

# Run Playwright deployment verification tests
verify:
	@echo "Running deployment verification tests..."
	@EXPECTED_VERSION=$$(cat public/version.json | jq -r '.version') && \
		echo "Expected version: $$EXPECTED_VERSION" && \
		EXPECTED_VERSION=$$EXPECTED_VERSION npx playwright test tests/deployment-verify.spec.ts --reporter=list

# Show current deployed version
version-check:
	@echo "Deployed version:"
	@curl -sf -H "Host: $(HOST)" http://192.168.1.207/version.json | jq .

# Compare local vs deployed version
version-diff:
	@echo "=== Local version ==="
	@cat public/version.json | jq .
	@echo ""
	@echo "=== Deployed version ==="
	@curl -sf -H "Host: $(HOST)" http://192.168.1.207/version.json | jq . || echo "Could not fetch deployed version"

# Full deploy with verification (RECOMMENDED)
# 1. Generate version metadata
# 2. Build Docker image with cache-busted assets
# 3. Push to registry
# 4. Apply k8s manifests
# 5. Restart deployment
# 6. Wait for rollout
# 7. Health check
# 8. Run Playwright verification
deploy-verify: build push apply restart rollout health verify
	@echo ""
	@echo "=== Deployment Complete ==="
	@echo "URL: http://$(HOST)"
	@cat public/version.json | jq -r '"Version: \(.version)\nBranch: \(.branch)\nCommit: \(.message)"'

# Full deploy without verification
deploy: build push apply restart rollout health
	@echo "Deployed successfully to http://$(HOST)"

# Quick deploy: build, push, restart (skip apply if no k8s changes)
quick: build push restart rollout health
	@echo "Quick deployed to http://$(HOST)"

# Quick deploy with verification
quick-verify: build push restart rollout health verify
	@echo "Quick deploy verified at http://$(HOST)"

# Dev server
dev:
	pnpm dev

# Production build (local only, no Docker)
build-local: version
	pnpm build

# View pod logs
logs:
	KUBECONFIG=$(KUBECONFIG) kubectl -n $(NAMESPACE) logs -f deployment/$(IMAGE)

# Get pod status
status:
	KUBECONFIG=$(KUBECONFIG) kubectl -n $(NAMESPACE) get pods

# Describe deployment
describe:
	KUBECONFIG=$(KUBECONFIG) kubectl -n $(NAMESPACE) describe deployment $(IMAGE)

# Run all tests (unit + playwright)
test:
	pnpm test
	npx playwright test

# Run only playwright tests against production
test-prod:
	VERIFY_URL=http://$(HOST) npx playwright test tests/deployment-verify.spec.ts

# Clean build artifacts
clean:
	rm -rf .output dist node_modules/.vite
	@echo "Cleaned build artifacts"

# =============================================================================
# AI Image Generation (y.local)
# =============================================================================

# Generate a single AI image
# Usage: make image-gen PROMPT="your prompt here" OUTPUT="path/to/output.jpg"
image-gen:
ifndef PROMPT
	$(error PROMPT is required. Usage: make image-gen PROMPT="your prompt" OUTPUT="output.jpg")
endif
ifndef OUTPUT
	$(error OUTPUT is required. Usage: make image-gen PROMPT="your prompt" OUTPUT="output.jpg")
endif
	@echo "Generating image: $(OUTPUT)"
	@curl -s -X POST http://y.local/ -H "Content-Type: application/json" \
		-d '{"operationName":"image.generate","input":{"prompt":"$(PROMPT)","size":"1024x1024"}}' \
		| jq -r '.data.image' | base64 -d > $(OUTPUT)
	@echo "Saved to $(OUTPUT)"
	@ls -lh $(OUTPUT)

# Generate multiple images from a JSON spec file
# Usage: make image-gen-batch SPEC="images.json" DIR="public/images"
# Spec format: [{"prompt": "...", "filename": "image.jpg"}, ...]
image-gen-batch:
ifndef SPEC
	$(error SPEC is required. Usage: make image-gen-batch SPEC="spec.json" DIR="public/dir")
endif
ifndef DIR
	$(error DIR is required. Usage: make image-gen-batch SPEC="spec.json" DIR="public/dir")
endif
	@mkdir -p $(DIR)
	@echo "Generating images from $(SPEC) to $(DIR)..."
	@jq -c '.[]' $(SPEC) | while read item; do \
		prompt=$$(echo $$item | jq -r '.prompt'); \
		filename=$$(echo $$item | jq -r '.filename'); \
		echo "Generating: $$filename"; \
		curl -s -X POST http://y.local/ -H "Content-Type: application/json" \
			-d "{\"operationName\":\"image.generate\",\"input\":{\"prompt\":\"$$prompt\",\"size\":\"1024x1024\"}}" \
			| jq -r '.data.image' | base64 -d > $(DIR)/$$filename; \
		sleep 1; \
	done
	@echo "Done! Generated $$(jq length $(SPEC)) images to $(DIR)"

# =============================================================================

# Help
help:
	@echo "Egypt Web Deployment Commands"
	@echo ""
	@echo "Production (recommended):"
	@echo "  make deploy-verify  - Full deploy with Playwright verification"
	@echo "  make quick-verify   - Quick deploy with verification (skip k8s apply)"
	@echo ""
	@echo "Without verification:"
	@echo "  make deploy         - Full deploy"
	@echo "  make quick          - Quick deploy"
	@echo ""
	@echo "Verification:"
	@echo "  make verify         - Run Playwright tests against deployed app"
	@echo "  make version-check  - Show deployed version"
	@echo "  make version-diff   - Compare local vs deployed version"
	@echo ""
	@echo "Development:"
	@echo "  make dev            - Start dev server"
	@echo "  make build-local    - Build locally"
	@echo "  make test           - Run all tests"
	@echo ""
	@echo "Debugging:"
	@echo "  make logs           - View pod logs"
	@echo "  make status         - Get pod status"
	@echo "  make describe       - Describe deployment"
	@echo ""
	@echo "AI Image Generation (y.local):"
	@echo "  make image-gen PROMPT=\"...\" OUTPUT=\"path.jpg\"  - Generate single image"
	@echo "  make image-gen-batch SPEC=\"spec.json\" DIR=\"dir\" - Batch generate from JSON spec"
