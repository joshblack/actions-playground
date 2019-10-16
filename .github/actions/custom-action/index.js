'use strict';

const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  const { GITHUB_REF, GITHUB_REPOSITORY } = process.env;
  const token = core.getInput('GITHUB_TOKEN');
  const octokit = new github.GitHub(token);
  const [owner, repo] = GITHUB_REPOSITORY.split('/');

  const { data } = await octokit.repos.createDeployment({
    owner,
    repo,
    ref: GITHUB_REF,
    environment: 'preview',
    description: 'test description',
  });

  console.log(data.id);
  // await octokit.repos.createDeploymentStatus({
    // owner,
    // repo,
    // id: data.id,
    // // 'error', 'failure', 'inactive', 'in_progress', 'queued pending',
    // // 'success'
    // state: 'in_progress',
  // });

  // await sleep(10000);

  // await octokit.repos.createDeploymentStatus({
    // owner,
    // repo,
    // id: data.id,
    // // 'error', 'failure', 'inactive', 'in_progress', 'queued pending',
    // // 'success'
    // state: 'success',
  // });
}

function sleep(ms = 1000) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

run().catch(error => {
  console.log(error);
  process.exit(1);
});
