'use strict';

const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  console.log('hi');
  // const { context } = github;
  // const token = core.getInput('GITHUB_TOKEN');
  // const octokit = new github.GitHub(token, {
  // previews: ['flash-preview'],
  // });

  // const { pull_request: pullRequest } = context.payload;
  // if (!pullRequest) {
  // throw new Error(`Unable to determine pull request from context`);
  // }

  // const { id, labels, number, repository, state, draft, user } = pullRequest;

  // // We only want to work with Pull Requests marked as open
  // if (state !== 'open') {
  // return;
  // }

  // // We only want to work with Pull Requests that are not draft PRs
  // if (draft) {
  // return;
  // }

  // const { name, owner } = repository;
  // console.log(name);
  // console.log(owner);
  // console.log(user);

  // Check if review is approval or not

  // list reviewers
  // octokit.pulls.listReviews({ owner, repo, pull_number });

  // list labels for review

  // check if reviewer is collaborator
  // octokit.repos.checkCollaborator({ owner, repo, username });

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
  core.setFailed(error);
  process.exit(1);
});
