# The test image: Playwright's own image (its browsers and their system libraries) plus this
# project. The tag must match @playwright/test in package.json, so upgrade both together.
FROM mcr.microsoft.com/playwright:v1.64.1-noble

WORKDIR /app

# Behind a TLS-inspecting corporate proxy, npm and the tests need the company's root CA. Put the
# .crt file in certs/ and uncomment these lines (README.md, "Corporate certificates").
# COPY certs/ /usr/local/share/ca-certificates/
# RUN update-ca-certificates
# ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/corp-root-ca.crt

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .

# CI=true: one retry, and a committed test.only fails the run instead of skipping everything else.
ENV CI=true
# Everything else is set with environment variables when the container runs (README.md).
CMD ["npx", "playwright", "test"]
