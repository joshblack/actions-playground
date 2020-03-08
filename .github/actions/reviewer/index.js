'use strict';

const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  const { context } = github;
  const token = core.getInput('GITHUB_TOKEN');
  const octokit = new github.GitHub(token);

  const { pull_request: pullRequest, repository, review } = context.payload;
  if (!pullRequest) {
    throw new Error(`Unable to determine pull request from context`);
  }

  // check if reviewer is collaborator
  const {
    data: permissionLevel,
  } = await octokit.repos.getCollaboratorPermissionLevel({
    owner: repository.owner.login,
    repo: repository.name,
    username: review.user.login,
  });

  const acceptedPermissionLevels = new Set(['admin', 'write']);
  if (!acceptedPermissionLevels.has(permissionLevel.permission)) {
    return;
  }

  // We only work with reviews that are indicating approval
  if (review.state !== 'approved') {
    return;
  }

  const { id, labels, number, state, draft, user } = pullRequest;

  // We only want to work with Pull Requests marked as open
  if (state !== 'open') {
    return;
  }

  // We only want to work with Pull Requests that are not draft PRs
  if (draft) {
    return;
  }

  // list reviewers
  const { data: reviews } = octokit.pulls.listReviews({
    owner: repository.owner.login,
    repo: repository.name,
    pull_number: pullRequest.number,
  });

  console.log(reviews);

  // 2+: ready to review
  // 1: one review needed
  // 0: ready to merge

  // list labels for review

  // Add label to pull (issue)
  // octokit.issues.addLabels({ owner, repo, issue_number, labels: ['label-name'] });

  // Get all labels?

  // 1. Get the Pull Request
  // 2. Get the reviewers for the Pull Request
  // 3. Get the labels for the Pull Request
  // 4. Check reviewers against labels

  // Auto-merge?
  // octokit.pulls.merge({ owner, repo, pull_number });

  // Auto-update?
  // octokit.pulls.updateBranch({ owner, repo, pull_number });
}

run().catch(error => {
  console.log(error);
  process.exit(1);
});
