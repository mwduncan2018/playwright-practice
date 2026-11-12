import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { FullConfig, FullResult, Reporter, Suite } from '@playwright/test/reporter';

interface Options {
  historyDir: string;
  runId: string;
  keep: number;
  appFolder?: string;
  appUrl?: string;
  browser?: string;
}

interface Summary {
  runId: string;
  startTime: string;
  durationMs: number;
  status: FullResult['status'];
  // Null when the variable wasn't set. Missing from runs saved before these were recorded.
  appFolder?: string | null;
  appUrl?: string | null;
  browser?: string | null;
  passed: number;
  failed: number;
  flaky: number;
  skipped: number;
  branch: string | null;
  sha: string | null;
  dirty: boolean | null;
  args: string[];
  projects: string[];
}

/** Playwright's name for each test outcome, and the count it adds to in the summary. */
const countNames = { expected: 'passed', unexpected: 'failed', flaky: 'flaky', skipped: 'skipped' } as const;

/**
 * For local runs. At the end of a run it saves the run's summary next to its HTML report, deletes the
 * oldest runs beyond the number to keep, and rewrites playwright-history/index.html, which lists the
 * runs that are left.
 */
export default class RunHistoryReporter implements Reporter {
  private readonly options: Options;
  private suite: Suite | undefined;

  constructor(options: Options) {
    this.options = options;
  }

  // Nothing here prints progress. Saying so lets Playwright still add its usual line reporter.
  printsToStdio() {
    return false;
  }

  onBegin(_config: FullConfig, suite: Suite) {
    this.suite = suite;
  }

  // A problem here must never fail the test run, so each step reports its own error and moves on.
  onEnd(result: FullResult) {
    this.attempt('save the run summary', () => this.saveSummary(result));
    this.attempt('delete old runs', () => this.deleteOldRuns());
    this.attempt('update index.html', () => this.writeIndex());
  }

  private saveSummary(result: FullResult) {
    const counts = { passed: 0, failed: 0, flaky: 0, skipped: 0 };
    for (const test of this.suite?.allTests() ?? []) counts[countNames[test.outcome()]]++;

    const changes = git('status', '--porcelain');
    const testCommand = process.argv.indexOf('test');
    const summary: Summary = {
      runId: this.options.runId,
      startTime: result.startTime.toISOString(),
      durationMs: Math.round(result.duration),
      status: result.status,
      appFolder: this.options.appFolder || null,
      appUrl: this.options.appUrl || null,
      browser: this.options.browser || null,
      ...counts,
      branch: git('rev-parse', '--abbrev-ref', 'HEAD'),
      sha: git('rev-parse', '--short', 'HEAD'),
      dirty: changes === null ? null : changes !== '',
      args: testCommand === -1 ? [] : process.argv.slice(testCommand + 1),
      projects: this.suite?.suites.map((project) => project.title) ?? [],
    };

    const runDir = path.join(this.options.historyDir, this.options.runId);
    mkdirSync(runDir, { recursive: true });
    writeFileSync(path.join(runDir, 'summary.json'), JSON.stringify(summary, null, 2));
  }

  private deleteOldRuns() {
    for (const run of this.runFolders().slice(this.options.keep)) {
      if (run === this.options.runId) continue;
      this.attempt(`delete ${run}`, () =>
        rmSync(path.join(this.options.historyDir, run), { recursive: true, force: true, maxRetries: 3 }),
      );
    }
  }

  private writeIndex() {
    const summaries: Summary[] = [];
    for (const run of this.runFolders()) {
      const file = path.join(this.options.historyDir, run, 'summary.json');
      if (existsSync(file)) this.attempt(`read ${file}`, () => summaries.push(JSON.parse(readFileSync(file, 'utf8'))));
    }
    writeFileSync(path.join(this.options.historyDir, 'index.html'), indexPage(summaries, this.options.keep));
  }

  /** The run folders, newest first. Their names start with the time, so sorting them sorts by age. */
  private runFolders() {
    return readdirSync(this.options.historyDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
      .reverse();
  }

  private attempt(what: string, action: () => void) {
    try {
      action();
    } catch (error) {
      console.error(`Run history couldn't ${what}: ${error}`);
    }
  }
}

/** Runs a git command and returns what it prints, or null if git isn't installed or this isn't a repo. */
function git(...args: string[]) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 10_000,
      windowsHide: true,
    }).trim();
  } catch {
    return null;
  }
}

function indexPage(runs: Summary[], keep: number) {
  const rows = runs.map((run) => {
    const commit = run.sha ? `${run.branch}@${run.sha}${run.dirty ? ' (dirty)' : ''}` : 'n/a';
    // A dash for runs saved before these were recorded.
    const app =
      run.appFolder === undefined
        ? '-'
        : `${escapeHtml(run.appFolder ?? 'folder not set')}<br>` +
          `<span class="url">${escapeHtml(run.appUrl ?? 'URL not set')}</span>`;
    const browser = run.browser === undefined ? '-' : escapeHtml(run.browser ?? 'not set');
    return `      <tr class="${escapeHtml(run.status)}">
        <td>${escapeHtml(new Date(run.startTime).toLocaleString())}</td>
        <td>${formatDuration(run.durationMs)}</td>
        <td class="status">${escapeHtml(run.status)}</td>
        <td>${app}</td>
        <td>${browser}</td>
        <td class="count">${run.passed}</td>
        <td class="count">${run.failed}</td>
        <td class="count">${run.flaky}</td>
        <td class="count">${run.skipped}</td>
        <td>${escapeHtml(commit)}</td>
        <td><code>${escapeHtml(run.args.join(' '))}</code></td>
        <td><a href="./${encodeURIComponent(run.runId)}/html/index.html">Open report</a></td>
      </tr>`;
  });

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Run history</title>
    <style>
      body { margin: 24px; font: 14px system-ui, sans-serif; color: #1f2328; background: #ffffff; }
      h1 { font-size: 20px; }
      table { border-collapse: collapse; }
      th, td { padding: 6px 10px; border-bottom: 1px solid #d0d7de; text-align: left; vertical-align: top; }
      th { background: #f6f8fa; }
      .count { text-align: right; }
      .status { font-weight: 600; }
      .url { font-size: 12px; color: #59636e; }
      tr.passed .status { color: #1a7f37; }
      tr.failed, tr.timedout { background: #ffebe9; }
      tr.failed .status, tr.timedout .status { color: #cf222e; }
      tr.interrupted { background: #fff8c5; }
      tr.interrupted .status { color: #9a6700; }
    </style>
  </head>
  <body>
    <h1>Run history</h1>
    <p>Newest first. The newest ${keep} runs are kept.</p>
    <table>
      <tr>
        <th>Time</th><th>Duration</th><th>Status</th><th>App</th><th>Browser</th><th>Passed</th>
        <th>Failed</th><th>Flaky</th><th>Skipped</th><th>Commit</th><th>Arguments</th><th>Report</th>
      </tr>
${rows.join('\n')}
    </table>
  </body>
</html>
`;
}

function formatDuration(ms: number) {
  const seconds = Math.round(ms / 1000);
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}
