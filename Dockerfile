FROM node:12
EXPOSE 4000
WORKDIR /app
COPY . .
RUN npm ci
CMD npm run start
