FROM node:20-alpine

WORKDIR /app

ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_IMAGES_BASE_URL
ARG VITE_ENABLE_CDN_RESIZING
ARG VITE_PUBLIC_POSTHOG_KEY
ARG VITE_PUBLIC_POSTHOG_HOST

COPY package.json package-lock.json ./
RUN npm ci

RUN npm install -g serve

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
