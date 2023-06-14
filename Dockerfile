FROM node:18
RUN wget https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb \
  && dpkg -i packages-microsoft-prod.deb \
  && rm packages-microsoft-prod.deb \
  && apt-get update \
  && apt-get install -y dotnet-runtime-7.0 \
  && apt-get clean

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
COPY . .

RUN npm run build

EXPOSE 80
ENV PORT=80

ENTRYPOINT [ "npm", "start" ]
