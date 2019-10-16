FROM node:slim
COPY . .
RUN yarn install --production
RUN ls -al
ENTRYPOINT ["node", "./.github/actions/custom-action/index.js"]
