FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm config set registry https://registry.npmmirror.com
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "build", "--", "--host", "0.0.0.0", "--port", "5173"]