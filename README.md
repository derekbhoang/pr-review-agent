# PR Review Agent

PR Review Agent is an automated code review assistant that runs as a GitHub Action on pull requests.

It inspects changed lines alongside the surrounding repository context, then posts line-anchored review comments when it finds likely bugs, regressions, or maintainability issues likely to cause future bugs.

It may use nearby or related code to support a finding, but its comments stay anchored to the pull request diff.

## Quick Start

Add the workflow to `.github/workflows/pr-review-agent.yml`:

```yaml
name: PR Review Agent

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

permissions:
  contents: read
  pull-requests: write

jobs:
  review:
    if: ${{ github.event.pull_request.draft == false }}
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run PR Review Agent
        uses: derekbhoang/pr-review-agent@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

When a pull request is opened or updated, the agent reviews the changed lines and posts comments on issues it believes are worth a human reviewer's attention.

## Configuration

| Input | Required | Description |
| --- | --- | --- |
| `github-token` | Yes | Token used to read pull request data and post review comments. In most repositories, use `${{ secrets.GITHUB_TOKEN }}`. |
| `openai-api-key` | Yes | OpenAI API key used by the review agent. Store it as a repository secret, for example `OPENAI_API_KEY`. |

The workflow needs:

```yaml
permissions:
  contents: read
  pull-requests: write
```

## Workflow

1. A pull request is opened or updated.
2. The GitHub Action runs inside the repo.
3. The agent reads the PR diff and identifies the changed files & lines.
4. It also looks at surrounding repository context, not just the raw diff.
5. It searches for likely bugs, regressions, or maintainability problems likely to cause future bugs.
6. When it finds something worth flagging, it posts a review comment anchored to the relevant changed line in the PR diff.
7. Even if the reasoning depends on nearby or related code, the visible comment should stay attached to the PR's changed lines.

## Main Task

The agent's main task is:

> Find high-confidence, actionable [issues](#Issues) in a pull request and post them as line-anchored review comments.

It should behave like a careful reviewer who **only speaks up when there is a concrete risk**. The goal is not to summarize every change, enforce style preferences, or replace human review. The goal is to catch issues that are easy to miss and expensive to merge.

<a id="Issues"></a>

## Issues to Find

The agent should focus on issues a human reviewer would be glad to catch before merge:

- **Correctness bugs**: wrong logic, bad conditions, off-by-one errors, invalid assumptions, or broken control flow.
- **Regressions**: changes that break behavior existing code or users may already rely on.
- **Runtime failures**: null or undefined access, unhandled exceptions, missing imports, bad async handling, or type mismatches that can crash.
- **Security risks**: auth bypasses, unsafe input handling, secret exposure, injection risks, or permission mistakes.
- **Data integrity issues**: accidental deletion, duplicate writes, partial updates, race conditions, or transaction mistakes.
- **API and contract breaks**: changes that violate existing callers, schemas, return types, configuration expectations, or documented behavior.
- **Edge case failures**: problems with empty values, missing fields, large inputs, pagination, retries, timezones, concurrency, or other cases directly implied by the changed code.
- **Risky missing tests**: missing coverage for behavior that is new, fragile, security-sensitive, or likely to regress.
- **Maintainability risks**: confusing or duplicated logic only when it is likely to hide bugs or make future changes unsafe.

## Issues to Avoid

The agent should avoid comments that create noise instead of useful review signal:

- Style preferences or formatting nits.
- Generic suggestions without a concrete risk.
- Broad architectural opinions unrelated to the changed lines.
- Comments on unchanged code unless they explain a problem in the pull request diff.
- Low-confidence guesses.
- Duplicate comments for the same root cause.
- Requests for extra tests when the risk is minor or already covered nearby.
