import { spawn } from 'child_process'
import path from 'path'

const JOBS_DIR = path.resolve('../../jobs')
const SERVER_URL = process.env['SERVER_URL'] ?? 'http://localhost:8080'

function spawnJob(scriptName: string, args: string[]): void {
  const secret = process.env['WEBHOOK_SECRET']
  if (!secret) throw new Error('WEBHOOK_SECRET is not configured')

  // Pass secret via env to keep it out of process args (not visible in ps/proc listings)
  const proc = spawn(
    'python',
    [path.join(JOBS_DIR, scriptName, 'main.py'), ...args, '--server-url', SERVER_URL],
    {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, WEBHOOK_SECRET: secret },
    },
  )
  proc.unref()
}

export function spawnExtractor(uploadId: string): void {
  spawnJob('extractor', ['--upload-id', uploadId])
}

export function spawnGenerator(uploadId: string): void {
  spawnJob('generator', ['--upload-id', uploadId])
}
