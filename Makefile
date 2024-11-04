
DOCKER_COMPOSE := docker compose

up:
	@$(DOCKER_COMPOSE) -f ./authentication-flow/docker-compose.yml watch 

logs:
	@$(DOCKER_COMPOSE) -f ./authentication-flow/docker-compose.yml logs -f app

down:
	@$(DOCKER_COMPOSE) -f ./authentication-flow/docker-compose.yml down

up-keycloak:
	@$(DOCKER_COMPOSE) -f ./keycloak/docker-compose.yml up -d

down-keycloak:
	@$(DOCKER_COMPOSE) -f ./keycloak/docker-compose.yml down
