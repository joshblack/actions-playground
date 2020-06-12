'use strict';

const github = require('@actions/github');
const core = require('@actions/core');

const labels = new Map([
  ['waiting-on-maintainer', 'waiting on maintainer response'],
  ['waiting-on-author', `waiting on author's response`],
]);

async function run() {
  const { context } = github;
  const token = core.getInput('GITHUB_TOKEN', {
    required: true,
  });
  const octokit = new github.GitHub(token);
  const { issue, repository } = context.payload;

  await octokit.issues.addLabels({
    owner: repository.owner.login,
    repo: repository.name,
    issue_number: issue.number,
    labels: [
      labels.get('waiting-on-maintainer'),
      labels.get('waiting-on-author'),
    ],
  });
}

run().catch(error => {
  console.log(error);
  process.exit(1);
});
