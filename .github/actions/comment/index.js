'use strict';

const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  const { context } = github;
  const token = core.getInput('GITHUB_TOKEN', {
    required: true,
  });
  const octokit = new github.GitHub(token);
  console.log(github.context);

  // const needsTriageLabel = 'needs triage';
  // needs more info
}

run().catch(error => {
  console.log(error);
  process.exit(1);
});
