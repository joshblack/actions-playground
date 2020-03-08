'use strict';

const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  const { context } = github;
  const token = core.getInput('GITHUB_TOKEN', {
    required: true,
  });
  const autoLabelUsers = core.getInput('AUTO_LABEL_USERS') || [];
  const octokit = new github.GitHub(token);
  const { pull_request: pullRequest, repository, review } = context.payload;
  const { id, labels, number, state, draft, user } = pullRequest;

  // We only want to work with Pull Requests that are marked as open
  if (state !== 'open') {
    return;
  }

  // We only want to work with Pull Requests that are not draft PRs
  if (draft) {
    return;
  }

  const {
    data: permissionLevel,
  } = await octokit.repos.getCollaboratorPermissionLevel({
    owner: repository.owner.login,
    repo: repository.name,
    username: review.user.login,
  });

  // If the reviewer doesn't have one of the following permission levels
  // then ignore the event
  const acceptedPermissionLevels = new Set(['admin', 'write']);
  if (!acceptedPermissionLevels.has(permissionLevel.permission)) {
    return;
  }

  // If the review was not an approval then we'll ignore the event
  if (review.state !== 'approved') {
    return;
  }

  const { data: allReviews } = await octokit.pulls.listReviews({
    owner: repository.owner.login,
    repo: repository.name,
    pull_number: pullRequest.number,
  });

  console.log(JSON.stringify(allReviews, null, 2));

  // The `listReviews` endpoint will return all of the reviews for the pull
  // request. We only care about the most recent reviews so we'll go through the
  // list and get the most recent review for each reviewer
  const reviewers = {};
  const reviews = [];

  // Process reviews in reverse order since they are listed from oldest to newest
  for (const review of allReviews.reverse()) {
    const { author_association: association, user } = review;
    // If we've already saved a review for this user we already have the most
    // recent review
    if (reviewers[user.login]) {
      continue;
    }

    // If the author of the review is not a collaborator we ignore it
    if (association !== 'COLLABORATOR') {
      continue;
    }

    reviewers[user.login] = true;
    reviews.push(review);
  }

  const approved = reviews.filter(review => {
    return review.state === 'APPROVED';
  });

  const additionalReviewLabel = 'one more review';
  const readyForReviewLabel = 'ready for review';
  const readyToMergeLabel = 'ready to merge';

  console.log(approved.length);

  if (approved.length > 0) {
    const hasReadyLabel = pullRequest.labels.find(label => {
      return label.name === readyForReviewLabel;
    });
    if (hasReadyLabel) {
      await octokit.issues.removeLabel({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: pullRequest.number,
        name: readyForReviewLabel,
      });
    }
  }

  if (approved.length === 1) {
    const hasAdditionalReviewLabel = pullRequest.labels.find(label => {
      return label.name === additionalReviewLabel;
    });
    if (!hasAdditionalReviewLabel) {
      await octokit.issues.addLabels({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: pullRequest.number,
        labels: [additionalReviewLabel],
      });
    }
    return;
  }

  if (approved.length >= 2) {
    const hasAdditionalReviewLabel = pullRequest.labels.find(label => {
      return label.name === additionalReviewLabel;
    });
    if (hasAdditionalReviewLabel) {
      await octokit.issues.removeLabel({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: pullRequest.number,
        name: additionalReviewLabel,
      });
    }

    const shouldAutoLabel = autoLabelUsers.find(user => {
      return user.login === pullRequest.user.login;
    });

    if (shouldAutoLabel) {
      await octokit.issues.addLabels({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: pullRequest.number,
        labels: [readyToMergeLabel],
      });
    }
    return;
  }

  // Auto-merge?
  // octokit.pulls.merge({ owner, repo, pull_number });

  // Auto-update?
  // octokit.pulls.updateBranch({ owner, repo, pull_number });
}

run().catch(error => {
  console.log(error);
  process.exit(1);
});
