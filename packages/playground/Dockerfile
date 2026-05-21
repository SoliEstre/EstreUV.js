# EstreUV playground — staging image (nginx static, no build step).
#
# The playground is a no-build PWA whose import map references
# /node_modules/lit, /node_modules/estreuv/src, ... so node_modules must
# sit at the web root. Stage 1 resolves them from the npm registry
# (estreuv:"*" → latest published, e.g. 0.2.0 — staging thus exercises the
# REAL published artifact, aligning with GA gate G3). Stage 2 bakes the
# static app + node_modules + nginx config into a self-contained image.
#
# Build locally:  docker build -t estreuv-playground:<tag> packages/playground
# Then transfer + run on the NAS staging (see deploy/DEPLOY.md).

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
# static app (Dockerfile/nginx.conf/etc. excluded via .dockerignore)
COPY . .
# import-map dependency root
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 80
