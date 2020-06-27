'use strict';

const github = require('@actions/github');
const core = require('@actions/core');

const labels = new Map([
  ['waiting-on-maintainer', 'waiting on maintainer response'],
  ['waiting-on-author', `waiting on author's response`],
]);

// opened
// closed
// commented
// labeled
// unlabeled

async function run() {
  const enabled = core.getInput('enabled') || true;
  if (!enabled) {
    core.info('Action is not enabled. Exiting');
    return;
  }

  const { context } = github;
  const token = core.getInput('GITHUB_TOKEN', {
    required: true,
  });
  const octokit = new github.GitHub(token);
  const { issue } = context.payload;

  if (issue.pull_request) {
    core.info('Action ran for a Pull Request that does not apply. Exiting');
    return;
  }

  const plugins = [addTriageLabel, addWaitingForResponse];
  for (const plugin of plugins) {
    await plugin(context, octokit);
  }

  // await octokit.issues.addLabels({
  // owner: repository.owner.login,
  // repo: repository.name,
  // issue_number: issue.number,
  // labels: [
  // labels.get('waiting-on-maintainer'),
  // labels.get('waiting-on-author'),
  // ],
  // });
}

const needsTriageLabel = 'needs triage';

async function addTriageLabel(context, octokit) {
  const { action, issue, repository } = context.payload;
  if (action !== 'opened') {
    return;
  }

  const hasTriageLabel = issue.labels.find(label => {
    return label.name === needsTriageLabel;
  });

  if (!hasTriageLabel) {
    await octokit.issues.addLabels({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      labels: [needsTriageLabel],
    });
  }
}

async function addWaitingForResponse(context, octokit) {
  const { action, comment, issue, repository } = context.payload;
  if (action !== 'created') {
    return;
  }

  const hasTriageLabel = issue.labels.find(label => {
    return label.name === needsTriageLabel;
  });
  if (!hasTriageLabel) {
    return;
  }

  const author = `waiting on author's response`;
  const maintainer = `waiting on maintainer response`;

  // none
  // member
  // first_time_contributor
  // first_timer
  // contributor
  //
  // owner
  // collaborator
  const roles = new Set(['OWNER', 'COLLABORATOR']);

  // waiting for author's response
  if (roles.has(comment.author_association)) {
    const hasMaintainerLabel = issue.labels.find(label => {
      return label === maintainer;
    });
    if (hasMaintainerLabel) {
      await octokit.issues.removeLabel({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: issue.number,
        labels: [maintainer],
      });
    }

    const hasAuthorLabel = issue.labels.find(label => {
      return label === author;
    });

    if (hasAuthorLabel) {
      return;
    }

    await octokit.issues.addLabels({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      labels: [author],
    });
  } else {
    const hasAuthorLabel = issue.labels.find(label => {
      return label === author;
    });
    if (hasAuthorLabel) {
      await octokit.issues.removeLabel({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: issue.number,
        labels: [author],
      });
    }

    const hasMaintainerLabel = issue.labels.find(label => {
      return label === maintainer;
    });
    if (hasMaintainerLabel) {
      return;
    }

    await octokit.issues.addLabels({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: issue.number,
      labels: [maintainer],
    });
  }
}

run().catch(error => {
  console.log(error);
  process.exit(1);
});
