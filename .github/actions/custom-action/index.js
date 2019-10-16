'use strict';

const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  console.log(process.env.GITHUB_REF);
  // const token = core.getInput('GITHUB_TOKEN');

  // const octokit = new github.GitHub(token);

  // await octokit.repos.createDeployment
}

run().catch(error => {
  console.log(error);
  process.exit(1);
});
