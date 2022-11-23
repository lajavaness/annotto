FROM node:16-alpine as builder-annotto-front
RUN mkdir -p /app
WORKDIR /app
COPY annotto-front /app

RUN yarn && yarn build

FROM node:16-alpine as builder-annotto-api
WORKDIR /app
COPY . .
RUN yarn && yarn build

FROM node:16-alpine

COPY --from=builder-annotto-front /app annotto-front
COPY --from=builder-annotto-api /app annotto-api

EXPOSE 5001
EXPOSE 3000

CMD ["yarn", "--cwd", "annotto-front", "serve", "&"]
CMD ["yarn", "--cwd", "annotto-api", "start", "&"]
