# Make rules
up:
	docker compose -f docker-compose.yml up -d

stop:
	docker compose -f docker-compose.yml stop

start:
	docker compose -f docker-compose.yml start

prune:
	docker system prune --volumes --all

down:
	docker compose down

build:
	docker compose build --no-cache

clean:	prune

dev:
	docker compose -f docker-compose.dev.yml up

.PHONY	=		up start down build stop prune clean dev