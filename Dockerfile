FROM node:17 as development
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install --package-lock
ARG PORT
ENV PORT=$PORT
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

FROM node:17 as production
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install --package-lock
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]