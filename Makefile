.PHONY: help install dev dev-story build build-lib build-editor build-story preview preview-story lint lint-fix test test-lib test-editor test-watch test-e2e build-parser clean release release-patch release-minor release-major _release-bump

help: ## Show this help
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	pnpm install
	$(MAKE) build-parser

dev: ## Start editor dev server (port 5555)
	pnpm --filter @blueprint-chart/editor dev

dev-story: ## Start Histoire dev server (UI component stories)
	pnpm --filter @blueprint-chart/ui story:dev

build: ## Build all packages
	pnpm -r build

build-story: ## Build Histoire static site
	pnpm --filter @blueprint-chart/ui story:build

build-lib: ## Build lib package (ES + IIFE runtime)
	pnpm --filter @blueprint-chart/lib build

build-editor: ## Build editor for production
	pnpm --filter @blueprint-chart/editor build

build-parser: ## Generate Peggy DSL grammar (packages/lib)
	pnpm --filter @blueprint-chart/lib generate:parser

preview: ## Preview the production editor build
	pnpm --filter @blueprint-chart/editor preview

preview-story: ## Preview the built Histoire site
	pnpm --filter @blueprint-chart/ui story:preview

lint: ## Run ESLint across all packages
	pnpm lint

lint-fix: ## Run ESLint with auto-fix
	pnpm lint:fix

test: ## Run all unit tests once
	pnpm -r test

test-lib: ## Run lib tests once
	pnpm --filter @blueprint-chart/lib test

test-editor: ## Run editor tests once
	pnpm --filter @blueprint-chart/editor test

test-watch: ## Run editor tests in watch mode
	pnpm --filter @blueprint-chart/editor test:watch

test-e2e: ## Run Playwright e2e smoke tests
	npx playwright test

clean: ## Remove all build artifacts and node_modules
	rm -rf node_modules packages/*/node_modules packages/*/dist

# --- Release ---

release-patch: ## Bump all packages by patch, commit, and tag
	@$(MAKE) _release-bump BUMP=patch

release-minor: ## Bump all packages by minor, commit, and tag
	@$(MAKE) _release-bump BUMP=minor

release-major: ## Bump all packages by major, commit, and tag
	@$(MAKE) _release-bump BUMP=major

release: ## Set explicit version (VERSION=x.y.z), commit, and tag
	@if [ -z "$(VERSION)" ]; then echo "Usage: make release VERSION=x.y.z" >&2; exit 1; fi
	@$(MAKE) _release-bump BUMP=$(VERSION)

_release-bump:
	@if [ -n "$$(git status --porcelain)" ]; then echo "Working tree is dirty. Commit or stash first." >&2; exit 1; fi
	pnpm -r exec -- npm version --no-git-tag-version $(BUMP)
	@NEW_VERSION="$$(node -p "require('./packages/lib/package.json').version")"; \
	node scripts/verify-release-versions.mjs "v$$NEW_VERSION"; \
	git add packages/*/package.json; \
	git commit -m "chore(release): v$$NEW_VERSION"; \
	git tag "v$$NEW_VERSION"; \
	echo ""; \
	echo "Tagged v$$NEW_VERSION."; \
	echo "Next:"; \
	echo "  1. git push --follow-tags"; \
	echo "  2. Create a GitHub Release for v$$NEW_VERSION at:"; \
	echo "     https://github.com/blueprint-chart/blueprint-chart/releases/new?tag=v$$NEW_VERSION"
