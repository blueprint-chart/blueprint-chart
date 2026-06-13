.PHONY: help install dev dev-story dev-docs build build-lib build-ui build-editor build-story build-docs preview preview-story preview-docs lint lint-fix test test-lib test-editor test-watch test-e2e build-parser clean release release-patch release-minor release-major _release-bump

help: ## Show this help
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	pnpm install
	$(MAKE) build-parser

dev: ## Start editor dev server (port 5555)
	pnpm --filter @blueprint-chart/editor dev

dev-story: ## Start Histoire dev server (UI component stories)
	pnpm --filter @blueprint-chart/ui story:dev

dev-docs: build-ui ## Start VitePress dev server (docs site, 0.0.0.0:4445)
	pnpm --filter @blueprint-chart/docs dev

build: ## Build all packages
	pnpm -r build

build-story: ## Build Histoire static site
	pnpm --filter @blueprint-chart/ui story:build

build-docs: build-ui ## Build the VitePress docs site
	pnpm --filter @blueprint-chart/docs build

build-lib: ## Build lib package (ES + IIFE runtime)
	pnpm --filter @blueprint-chart/lib build

build-ui: ## Build ui package
	pnpm --filter @blueprint-chart/ui build

build-editor: build-lib build-ui ## Build editor for production
	pnpm --filter @blueprint-chart/editor build

build-parser: ## Generate Peggy DSL grammar (packages/lib)
	pnpm --filter @blueprint-chart/lib generate:parser

preview: ## Preview the production editor build
	pnpm --filter @blueprint-chart/editor preview

preview-story: ## Preview the built Histoire site
	pnpm --filter @blueprint-chart/ui story:preview

preview-docs: ## Preview the built VitePress docs site
	pnpm --filter @blueprint-chart/docs preview

lint: ## Run ESLint across all packages
	pnpm lint

lint-fix: ## Run ESLint with auto-fix
	pnpm lint:fix

test: build-lib build-ui ## Run all unit tests once
	pnpm -r test

test-lib: ## Run lib tests once
	pnpm --filter @blueprint-chart/lib test

test-editor: build-lib build-ui ## Run editor tests once
	pnpm --filter @blueprint-chart/editor test

test-watch: build-lib build-ui ## Run editor tests in watch mode
	pnpm --filter @blueprint-chart/editor test:watch

test-e2e: build-lib build-ui ## Run Playwright e2e smoke tests
	npx playwright test

clean: ## Remove all build artifacts and node_modules
	rm -rf node_modules packages/*/node_modules packages/*/dist

# --- Release ---

release-patch: ## [fallback] Manual patch release — CI auto-releases from commits; use only if automation is down
	@$(MAKE) _release-bump BUMP=patch

release-minor: ## [fallback] Manual minor release — CI auto-releases from commits; use only if automation is down
	@$(MAKE) _release-bump BUMP=minor

release-major: ## [fallback] Manual major release — CI auto-releases from commits; use only if automation is down
	@$(MAKE) _release-bump BUMP=major

release: ## [fallback] Manual explicit release (VERSION=x.y.z) — CI auto-releases from commits
	@if [ -z "$(VERSION)" ]; then echo "Usage: make release VERSION=x.y.z" >&2; exit 1; fi
	@$(MAKE) _release-bump BUMP=$(VERSION)

_release-bump:
	@if [ -n "$$(git status --porcelain)" ]; then echo "Working tree is dirty. Commit or stash first." >&2; exit 1; fi
	pnpm -r exec -- npm version --no-git-tag-version $(BUMP)
	@NEW_VERSION="$$(node -p "require('./packages/lib/package.json').version")"; \
	node scripts/verify-release-versions.mjs "v$$NEW_VERSION"; \
	git add packages/*/package.json; \
	git commit -m "chore(release): v$$NEW_VERSION"; \
	git tag -a "v$$NEW_VERSION" -m "v$$NEW_VERSION"; \
	echo ""; \
	echo "Tagged v$$NEW_VERSION."; \
	echo "Next:"; \
	echo "  1. git push --follow-tags"; \
	echo "  2. Create a GitHub Release for v$$NEW_VERSION at:"; \
	echo "     https://github.com/blueprint-chart/blueprint-chart/releases/new?tag=v$$NEW_VERSION"
