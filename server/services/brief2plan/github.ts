import { Octokit } from '@octokit/rest';
import { createError } from 'h3';

import type { RequirementBrief, Task } from '@prisma/client';

interface GithubExportOptions {
  token: string;
  repo: string;
  brief: RequirementBrief;
  tasks: Task[];
}

export const exportTasksToGithub = async ({ token, repo, brief, tasks }: GithubExportOptions) => {
  const [owner, repoName] = repo.split('/');
  if (!owner || !repoName) {
    throw createError({ statusCode: 400, statusMessage: 'リポジトリ名は owner/name 形式で入力してください。' });
  }

  if (token === 'mock' || process.env.GITHUB_MOCK === '1') {
    return {
      createdIssues: tasks.length,
      issueUrls: tasks.map((task, index) => `https://github.com/${repo}/issues/${index + 1}`),
      dryRun: true
    };
  }

  const octokit = new Octokit({ auth: token });
  const issueUrls: string[] = [];

  for (const task of tasks) {
    const bodyLines = [
      task.description,
      '',
      `- 期待時間: ${(task.mostLikelyH).toFixed(1)}h`,
      `- 依存タスク: ${task.dependsOn.length ? task.dependsOn.join(', ') : 'なし'}`
    ];
    const response = await octokit.rest.issues.create({
      owner,
      repo: repoName,
      title: `[${brief.title}] ${task.name}`,
      body: bodyLines.join('\n')
    });
    issueUrls.push(response.data.html_url);
  }

  return { createdIssues: issueUrls.length, issueUrls, dryRun: false };
};
