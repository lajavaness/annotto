FROM node:lts-alpine as builder

COPY yarn*.lock ./
COPY package*.json ./
RUN yarn install

# The instructions for second stage
FROM node:lts-alpine

RUN apk update && apk add bash && apk add curl

EXPOSE 5001

WORKDIR /annotto

COPY . .
COPY --from=builder node_modules node_modules

RUN  rm -f .npmrc

CMD yarn start

