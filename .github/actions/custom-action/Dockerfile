FROM node:slim
COPY . .
RUN yarn install --production
ENTRYPOINT ["node", "./github/actions/custom-action/index.js"]
