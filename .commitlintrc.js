module.exports = {
  extends: ['@commitlint/config-conventional'],
    rules: {
      'type-enum': [
      2,
      'always',
      // 暂时定为默认值，根据自己的需求调整
      ['build', 'ci', 'chore', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test']
    ]
  }
}
