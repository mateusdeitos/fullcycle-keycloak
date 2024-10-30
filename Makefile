
DOCKER_COMPOSE := docker compose

up:
	@$(DOCKER_COMPOSE) -f ./authentication-flow/docker-compose.yml watch

up-keycloak:
	@$(DOCKER_COMPOSE) -f ./keycloak/docker-compose.yml up

down-keycloak:
	@$(DOCKER_COMPOSE) -f ./keycloak/docker-compose.yml down
