'use strict';

const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  console.log(JSON.stringify(github.context, null, 2));
  // const { GITHUB_REF, GITHUB_SHA, GITHUB_REPOSITORY } = process.env;
  // const token = core.getInput('GITHUB_TOKEN');
  // const octokit = new github.GitHub(token, {
    // previews: ['flash-preview'],
  // });
  // const [owner, repo] = GITHUB_REPOSITORY.split('/');

  // const { data } = await octokit.repos.createDeployment({
    // owner,
    // repo,
    // // ref: GITHUB_REF,
    // // ref: GITHUB_SHA,
    // ref: 'joshblack-patch-1',
    // environment: 'preview',
    // description: 'test description',
  // });

  // console.log('creating in progress');
  // const { data: result } = await octokit.repos.createDeploymentStatus({
    // owner,
    // repo,
    // deployment_id: data.id,
    // // 'error', 'failure', 'inactive', 'in_progress', 'queued pending',
    // // 'success'
    // state: 'in_progress',
  // });
  // console.log(result);

  // console.log('sleeping');
  // await sleep(10000);

  // console.log('creating success');
  // await octokit.repos.createDeploymentStatus({
    // owner,
    // repo,
    // deployment_id: data.id,
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
