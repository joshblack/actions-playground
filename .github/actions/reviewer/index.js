'use strict';

const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  const { context } = github;
  const token = core.getInput('GITHUB_TOKEN');
  const octokit = new github.GitHub(token, {
    previews: ['flash-preview'],
  });

  console.log(context);

  // 1. Get the Pull Request
  // 2. Get the reviewers for the Pull Request
  // 3. Get the labels for the Pull Request
  // 4. Check reviewers against labels
}

run().catch(error => {
  core.setFailed(error);
  process.exit(1);
});
