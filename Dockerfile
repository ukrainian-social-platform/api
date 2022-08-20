FROM node:18-alpine as build
COPY . /app
WORKDIR /app
RUN yarn install --frozen-lockfile
RUN yarn build

FROM gcr.io/distroless/nodejs:18
COPY --from=build /app/dist /app
WORKDIR /app
ENV NODE_ENV=production
CMD [ "main.js" ]
