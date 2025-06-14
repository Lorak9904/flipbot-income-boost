FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm config set registry https://registry.npmmirror.com
RUN npm install

RUN npm install -g serve

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]