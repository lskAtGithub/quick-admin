// 根据 zh.json 生成其他语言的 i18n 文件：选择语种 → diff → 百度翻译补缺 → 写入 langs/<code>.json

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prompts from 'prompts';
import chalk from 'chalk';
import ora from 'ora';
import CONFIG from './config.js';
import { collectExtra, collectMissing, countStringLeaves, merge } from './diff.js';
import { translateAll } from './translator.js';

const LANGS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../src/i18n/langs');

const readJson = (file) => JSON.parse(readFileSync(file, 'utf-8'));

function report({ code, total, missing, translated, failed, extra }) {
  console.log();
  console.log(chalk.bold.blue(`i18n 生成报告（${code}.json）`));
  console.log(chalk.green(`  ✔ 新增译文    ${translated.size} 条`));
  console.log(chalk.gray(`  - 已有跳过    ${total - missing.length} 条（目标文件已存在译文，本轮不重翻）`));
  if (failed.length) console.log(chalk.red(`  ✘ 翻译失败    ${failed.length} 条，未写入，重跑本脚本会自动补翻：`));
  failed.slice(0, 20).forEach((f) => console.log(chalk.red(`      ${f.path}  「${f.text}」  ${f.reason}`)));
  if (failed.length > 20) console.log(chalk.red(`      …… 其余 ${failed.length - 20} 条省略`));
  if (extra.length) console.log(chalk.yellow(`  ⚠ zh.json 中不存在的多余 key ${extra.length} 个（已保留未删除）：`));
  extra.slice(0, 20).forEach((p) => console.log(chalk.yellow(`      ${p}`)));
  if (extra.length > 20) console.log(chalk.yellow(`      …… 其余 ${extra.length - 20} 个省略`));
}

async function run() {
  const zh = readJson(path.join(LANGS_DIR, `${CONFIG.SOURCE}.json`));

  const answer = await prompts({
    type: 'select',
    name: 'lang',
    message: '选择需要生成的语言',
    choices: CONFIG.LANGUAGES.map((l) => ({ title: l.label, value: l })),
    optionsPerPage: CONFIG.LANGUAGES.length
  });
  const lang = answer.lang;
  if (!lang) {
    console.log(chalk.gray('已取消'));
    return;
  }

  const { APP_ID, SECRET } = CONFIG.BAIDU_FANYI;
  if (!APP_ID || APP_ID === 'your_app_id' || !SECRET || SECRET === 'your_secret_key') {
    console.log(chalk.red('✘ 未配置百度翻译凭据，请先在 scripts/create-i18n/config.js 填入 APP_ID / SECRET'));
    process.exitCode = 1;
    return;
  }

  const targetFile = path.join(LANGS_DIR, `${lang.code}.json`);
  let target = {};
  if (existsSync(targetFile)) {
    try {
      target = readJson(targetFile);
    } catch {
      console.log(chalk.red(`✘ 目标文件 ${path.relative(process.cwd(), targetFile)} 不是合法 JSON，已中止（未覆盖）`));
      process.exitCode = 1;
      return;
    }
  }

  const missing = collectMissing(zh, target);
  const extra = collectExtra(zh, target);
  if (missing.length === 0) {
    console.log(chalk.green(`✔ ${lang.code}.json 与 zh.json 键集合已一致，无需翻译`));
    if (extra.length) console.log(chalk.yellow(`  另有 ${extra.length} 个 zh.json 中不存在的多余 key，已保留`));
    return;
  }
  console.log(chalk.gray(`  ${lang.code}.json 缺失 ${missing.length} 个 key，开始调用百度翻译…`));

  const spinner = ora(`翻译中 0/${missing.length}`).start();
  let translated, failed;
  try {
    ({ translated, failed } = await translateAll(missing, lang.baidu, (done, total) => {
      spinner.text = `翻译中 ${done}/${total}`;
    }));
  } catch (err) {
    spinner.fail('翻译中止');
    console.log(chalk.red(`  ${err.message}（已翻译内容未写入，修正后重跑即可）`));
    process.exitCode = 1;
    return;
  }
  translated.size ? spinner.succeed(`翻译完成 ${translated.size}/${missing.length}`) : spinner.warn(`翻译未成功（0/${missing.length}）`);

  if (translated.size > 0) {
    const result = merge(zh, target, translated);
    writeFileSync(targetFile, `${JSON.stringify(result, null, 2)}\n`, 'utf-8');
  }
  report({ code: lang.code, total: countStringLeaves(zh), missing, translated, failed, extra });
}

run().catch((err) => {
  console.error(chalk.red(err.stack || err.message));
  process.exitCode = 1;
});
