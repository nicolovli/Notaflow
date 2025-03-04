FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:20

RUN su node -c "npm install -g firebase-tools"

WORKDIR /workspace

EXPOSE 5173

USER node