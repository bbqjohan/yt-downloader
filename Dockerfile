FROM node:lts-alpine
WORKDIR /usr/local/app

COPY src/ ./src/
COPY src-tauri/ ./src-tauri/
COPY public/ ./public/

COPY package*.json ./
COPY index.html ./
COPY ./postcss.config.js ./
COPY ./tailwind.config.js ./
COPY ./tsconfig.json ./
COPY ./tsconfig.node.json ./
COPY ./vite.config.ts ./

RUN npm install
RUN useradd appuser

USER appuser
EXPOSE 5000

CMD ["npm", "run", "dev"]