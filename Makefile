.PHONY: install dev build lint lint-fix test test-watch ci

install:
	npm install

dev:
	npx vite

build:
	npx vue-tsc --noEmit && npx vite build

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix

test:
	npx vitest run

test-watch:
	npx vitest

ci: lint test build
