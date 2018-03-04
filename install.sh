#!/bin/sh
os=`uname -a`
os_check_centos=".*el7.*"
os_check_ubuntu="*Ubuntu*"
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
  bash -c "$1"
}

exec_cmd() {
  exec_cmd_nobail "$1" || bail
}

if [[ "$os" =~ $os_check_centos ]]; then
  # Install Dependence
  exec_cmd "cat bash/install_nodejs_centos.sh | sudo bash -"
  exec_cmd "yum update"
  exec_cmd "yum install -y nodejs redis"
  exec_cmd "npm config set registry https://registry.npm.taobao.org/"
  exec_cmd "npm i -g pnpm pm2"
  exec_cmd "pnpm i"
  print_status "Install Done!"
elif [[ "$os" =~ $os_check_ubuntu ]]; then
  exec_cmd "cat bash/install_nodejs_ubuntu.sh | sudo bash -"
  exec_cmd "apt update && apt upgrade"
  exec_cmd "apt install -y nodejs redis"
  exec_cmd "npm config set registry https://registry.npm.taobao.org/"
  exec_cmd "npm i -g pnpm pm2"
  exec_cmd "pnpm i"
  print_status "Install Done!"
else
  echo "not support system! ${os}"
  exit 1
fi
