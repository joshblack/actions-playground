'use strict';

const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  const { context } = github;
  const token = core.getInput('GITHUB_TOKEN', {
    required: true,
  });
  const octokit = new github.GitHub(token);
  console.log(context.payload);
  // const { action, issue, repository } = context.payload;
}

run().catch(error => {
  console.log(error);
  process.exit(1);
});
