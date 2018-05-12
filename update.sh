#!/bin/sh
print_status() {
  local outp=$(echo "$1" | sed -r 's/\\n/\\n## /mg')
  echo
  echo -e "## ${outp}"
  echo
}
bail() {
  echo 'Error executing command, exiting'
  exit 1
}
exec_cmd_nobail() {
  echo "+ $1"
  sh -c "$1"
}

exec_cmd() {
  exec_cmd_nobail "$1" || bail
}

print_status "Update Procedure"
exec_cmd "git pull"

print_status "Update Repos"
exec_cmd "pnpm i -g pnpm"
exec_cmd "pnpm i"

print_status "Restart Service"
exec_cmd "pm2 restart hitokoto"
