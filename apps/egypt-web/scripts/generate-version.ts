#!/usr/bin/env npx tsx
/**
 * Generate version.json for deployment verification
 *
 * This file is generated at build time and placed in public/
 * Playwright tests can fetch this to verify the correct version is deployed
 */

import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import { join } from 'path'

function getGitInfo() {
  try {
    const commit = execSync('git rev-parse --short HEAD').toString().trim()
    const fullCommit = execSync('git rev-parse HEAD').toString().trim()
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
    const dirty = execSync('git status --porcelain').toString().trim() ? true : false
    const message = execSync('git log -1 --pretty=%B').toString().trim().split('\n')[0]
    return { commit, fullCommit, branch, dirty, message }
  } catch {
    return { commit: 'unknown', fullCommit: 'unknown', branch: 'unknown', dirty: false, message: 'unknown' }
  }
}

const gitInfo = getGitInfo()

const version = {
  version: gitInfo.commit + (gitInfo.dirty ? '-dirty' : ''),
  commit: gitInfo.fullCommit,
  branch: gitInfo.branch,
  dirty: gitInfo.dirty,
  message: gitInfo.message,
  buildTime: new Date().toISOString(),
  buildTimestamp: Date.now(),
}

const outputPath = join(process.cwd(), 'public', 'version.json')
writeFileSync(outputPath, JSON.stringify(version, null, 2))

console.log('Generated version.json:')
console.log(JSON.stringify(version, null, 2))
