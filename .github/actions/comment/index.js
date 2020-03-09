'use strict';

const github = require('@actions/github');
const core = require('@actions/core');

async function run() {
  const { context } = github;
  const token = core.getInput('GITHUB_TOKEN', {
    required: true,
  });
  const octokit = new github.GitHub(token);
  const { action, issue, repository } = context.payload;
  const needsTriageLabel = 'needs triage';

  if (action === 'opened') {
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
    return;
  }
}

run().catch(error => {
  console.log(error);
  process.exit(1);
});
