import * as core from "@actions/core";
import * as github from "@actions/github";

type PullRequestContext = {
  repo: {
    owner: string;
    name: string;
  };

  pr: {
    number: number;
    isDraft: boolean;
  };

  branches: {
    baseRef: string;
    headRef: string;
  };

  commits: {
    baseSha: string;
    headSha: string;
  };

  author: {
    login: string;
  };

  content: {
    title: string;
    body: string | null;
  };

  links: {
    htmlUrl: string;
  };
};

function getPullRequestContext(): PullRequestContext {
  const { repo, payload } = github.context;
  const pullRequest = payload.pull_request;

  if (!pullRequest) {
    throw new Error("This action must be run on a pull_request event.");
  }

  return {
    repo: {
      owner: repo.owner,
      name: repo.repo,
    },

    pr: {
      number: pullRequest.number,
      isDraft: pullRequest.draft ?? false,
    },

    branches: {
      baseRef: pullRequest.base.ref,
      headRef: pullRequest.head.ref,
    },

    commits: {
      baseSha: pullRequest.base.sha,
      headSha: pullRequest.head.sha,
    },

    author: {
      login: pullRequest.user.login,
    },

    content: {
      title: pullRequest.title,
      body: pullRequest.body ?? null,
    },

    links: {
      htmlUrl: pullRequest.html_url ?? "",
    },
  };
}

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput("github-token", { required: true });
    const openaiApiKey = core.getInput("openai-api-key", { required: true });

    core.setSecret(githubToken);
    core.setSecret(openaiApiKey);

    core.info("PR Review Agent inputs loaded.");

    const pullRequestContext = getPullRequestContext();
    core.info(
      `Reviewing PR #${pullRequestContext.pr.number}: ${pullRequestContext.content.title}`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.setFailed(message);
  }
}

await run();
