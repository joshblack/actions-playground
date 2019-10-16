FROM node:slim

# WORKDIR /usr/src/action
# COPY . .
# RUN yarn install --production
# RUN ls -al
# RUN ls -al node_modules
WORKDIR /github/workspace
RUN yarn install --production
RUN ls -al
ENTRYPOINT ["node", "/github/workspace/.github/actions/custom-actions/index.js"]
