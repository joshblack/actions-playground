FROM node:slim

WORKDIR /usr/src/action
COPY . .
RUN yarn install --production
RUN ls -al
RUN ls -al node_modules
ENTRYPOINT ["node", "./.github/actions/custom-action/index.js"]
