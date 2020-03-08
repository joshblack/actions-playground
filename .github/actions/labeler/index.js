'use strict';

const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  const { context } = github;
  const token = core.getInput('GITHUB_TOKEN', {
    required: true,
  });
  const { pull_request: pullRequest } = context.payload;
  const readyForReviewLabel = 'ready for review';

  // We only want to work with Pull Requests that are not draft PRs
  if (pullRequest.draft) {
    return;
  }

  const hasReadyLabel = pullRequest.labels.find(label => {
    return label.name === readyForReviewLabel;
  });
  if (!hasReadyLabel) {
    await octokit.issues.addLabels({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: pullRequest.number,
      labels: [readyForReviewLabel],
    });
  }
}

run().catch(error => {
  console.log(error);
  process.exit(1);
});
