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

  // if issue is closed

  // const plugins = [addTriageLabel, addWaitingForResponse];
  const plugins = [triage, response];
  for (const plugin of plugins) {
    const filtered = plugin.filters.find(filter => {
      return filter.run(context, octokit);
    });

    if (filtered) {
      core.info(
        `Skipping plugin \`${plugin.name}\` due to filter: \`${filtered.key}\``
      );
      continue;
    }

    core.info(`Running plugin: \`${plugin.name}\``);
    await plugin.run(context, octokit);
  }
}

const needsTriageLabel = 'needs triage';

const triage = {
  name: 'Add triage label',
  filters: [events.issues.opened],
  async run(context, octokit) {
    const { issue, repository } = context.payload;
    const roles = new Set(['OWNER', 'COLLABORATOR']);
    if (roles.has(issue.author_association)) {
      core.info(
        'Issue opened by project collaborator. No triage label necessary'
      );
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
  },
};

const response = {
  name: 'Add triage response',
  filters: [events.comments.created, states.issue.open],
  async run(context, octokit) {
    const { comment, issue, repository } = context.payload;
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
        return label.name === maintainer;
      });
      if (hasMaintainerLabel) {
        await octokit.issues.removeLabel({
          owner: repository.owner.login,
          repo: repository.name,
          issue_number: issue.number,
          name: maintainer,
        });
      }

      const hasAuthorLabel = issue.labels.find(label => {
        return label.name === author;
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
        return label.name === author;
      });
      if (hasAuthorLabel) {
        await octokit.issues.removeLabel({
          owner: repository.owner.login,
          repo: repository.name,
          issue_number: issue.number,
          name: author,
        });
      }

      const hasMaintainerLabel = issue.labels.find(label => {
        return label.name === maintainer;
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
  },
};

const events = {
  issues: {
    opened: {
      key: 'issue_opened',
      run: action('opened'),
    },
  },
  comments: {
    created: {
      key: 'comment_created',
      run: action('created'),
    },
  },
};

const states = {
  issues: {
    open: {
      key: 'issue_is_open',
      run(context) {
        return !context.issue.closed_at;
      },
    },
    closed: {
      key: 'issue_is_closed',
      run(context) {
        return !!context.issue.closed_at;
      },
    },
  },
};

function action(name) {
  return context => context.payload.action === name;
}

async function addTriageLabel(context, octokit) {
  const { action, issue, repository } = context.payload;
  if (action !== 'opened') {
    return;
  }

  const roles = new Set(['OWNER', 'COLLABORATOR']);
  if (roles.has(issue.author_association)) {
    core.info(
      'Issue opened by project collaborator. No triage label necessary'
    );
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

  if (issue.closed_at) {
    core.info('Issue has been closed');
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
      return label.name === maintainer;
    });
    if (hasMaintainerLabel) {
      await octokit.issues.removeLabel({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: issue.number,
        name: maintainer,
      });
    }

    const hasAuthorLabel = issue.labels.find(label => {
      return label.name === author;
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
      return label.name === author;
    });
    if (hasAuthorLabel) {
      await octokit.issues.removeLabel({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: issue.number,
        name: author,
      });
    }

    const hasMaintainerLabel = issue.labels.find(label => {
      return label.name === maintainer;
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
