'use strict';

const github = require('@actions/github');
const core = require('@actions/core');

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
  const { action, issue, repository } = context.payload;

  if (issue.pull_request) {
    core.info('Action ran for a Pull Request that does not apply. Exiting');
    return;
  }
  const plugins = [addTriageLabel, addWaitingForResponse];

  for (const plugin of plugins) {
    await plugin(context, octokit);
  }
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
  const { action, repository } = context.payload;
  if (action !== 'commented') {
    return;
  }

  console.log(context.payload);

  const hasTriageLabel = issue.labels.find(label => {
    return label.name === needsTriageLabel;
  });
  if (!hasTriageLabel) {
    return;
  }
}

run().catch(error => {
  console.log(error);
  process.exit(1);
});
