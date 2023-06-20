FROM node:18-alpine as builder

RUN apk update && apk add bash && apk add curl

# install node-prune (https://github.com/tj/node-prune)
RUN curl -sf https://gobinaries.com/tj/node-prune | sh

WORKDIR /usr/src/app

COPY yarn*.lock ./
COPY package*.json ./

RUN yarn install --ignore-scripts # This will make installation only of root "./package.json", and not trigger the npm "prepare" scripts

# The instructions for second stage
COPY . .

RUN yarn build

# remove development dependencies
RUN npm prune --omit=dev

# run node prune
RUN /usr/local/bin/node-prune

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist dist
EXPOSE 5001
COPY --from=builder /usr/src/app/node_modules node_modules

CMD ["node", "./dist/src/index.js"]

