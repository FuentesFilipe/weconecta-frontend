SHELL := /bin/bash

ifeq ($(OS),Windows_NT)
  RM = powershell.exe -NoProfile -Command "Remove-Item -Recurse -Force"
else
  RM = sudo rm -rf
endif

.PHONY: install
install:
	$(RM) node_modules
	$(RM) .pnpm-store
	docker compose run --rm app pnpm install --force