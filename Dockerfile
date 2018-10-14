FROM node:10-alpine
RUN mkdir /app
WORKDIR /app
COPY package*.json /app/
RUN apk --no-cache --virtual build-dependencies add \
    krb5-dev \
    python \
    make \
    g++ \
    && npm install --silent \
    && apk del build-dependencies
EXPOSE 3030
