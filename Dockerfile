FROM node:22-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /npm_cache
COPY package*.json ./
RUN pnpm install

WORKDIR /app

ENTRYPOINT [ "/bin/sh", "-c", "cp -r /npm_cache/node_modules/. /app/node_modules && exec \"$0\" \"$@\"" ]

CMD ["npm", "run", "dev"]