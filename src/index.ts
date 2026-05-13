import * as core from "@actions/core";

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput("github-token", { required: true });
    const openaiApiKey = core.getInput("openai-api-key", { required: true });

    core.setSecret(githubToken);
    core.setSecret(openaiApiKey);

    core.info("PR Review Agent inputs loaded.");
    
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    core.setFailed(message);
  }
}

await run();