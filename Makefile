SHELL := /bin/bash

.PHONY: install
install:
	docker compose run --rm app pnpm install