# The image tag must match the exact @playwright/test version in package.json,
# because the browsers baked into the image are built for that version.
FROM mcr.microsoft.com/playwright:v1.64.1-noble

WORKDIR /app

# Install dependencies first so this layer is cached until package files change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV CI=true
CMD ["npx", "playwright", "test"]
