'use strict';

const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  const token = core.getInput('GITHUB_TOKEN');
  const octokit = new github.GitHub(token);

  const { data } = await octokit.pulls.list({
    owner: 'joshblack',
    repo: 'actions-playground',
  });

  console.log(data);
}

run().catch(error => {
  console.log(error);
  process.exit(1);
});
