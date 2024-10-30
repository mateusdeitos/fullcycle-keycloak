FROM node:19.0-slim

# Run as a non-privileged user
# RUN useradd -ms /bin/sh -u 1001 app
USER node

# Install dependencies
WORKDIR /app
COPY --chown=node:node package.json package-lock.json ./
RUN npm install

# Copy source files into application directory
COPY --chown=node:node . /app
