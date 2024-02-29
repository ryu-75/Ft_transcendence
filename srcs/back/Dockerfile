# Dev stage
FROM node:lts AS dev

WORKDIR /app
COPY . .
RUN npm install

# Build stage
FROM node:lts AS build

WORKDIR /app
COPY --from=dev /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate
RUN npm run build
RUN npm install --omit=dev

# Prod stage
FROM node:lts

WORKDIR /app
ARG NODE_ENV=production
COPY --from=build /app/dist dist
COPY package*.json ./
COPY --from=build /app/node_modules node_modules
COPY prisma prisma
COPY setup.sh ./

EXPOSE 3000

CMD ["sh", "setup.sh"]
