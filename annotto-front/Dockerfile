FROM node:18-alpine as builder

ARG BASE_URL
ARG KEYCLOAK_URL
ARG KEYCLOAK_REALM

RUN mkdir -p /app
WORKDIR /app
COPY . /app

COPY package*.json ./
RUN yarn && REACT_APP_BASE_URL=${BASE_URL} REACT_APP_KEYCLOAK_URL=${KEYCLOAK_URL} REACT_APP_KEYCLOAK_REALM=${KEYCLOAK_REALM} yarn build

# Destination image
FROM nginx:latest

# overrides default vhost config
COPY conf/nginx-vhost.conf /etc/nginx/conf.d/default.conf

# copy /app/build to nginx docroot
COPY --from=builder /app/build /usr/share/nginx/html
