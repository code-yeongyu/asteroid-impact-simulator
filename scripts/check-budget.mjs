#!/usr/bin/env node
/* global process */
import { spawnSync } from 'node:child_process';

const result = spawnSync('bunx', ['size-limit'], {
  encoding: 'utf-8',
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
