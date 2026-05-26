FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

RUN npm install -g serve

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
