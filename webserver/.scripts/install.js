#!/usr/bin/env node
const { spawnSync } = require("child_process");

const OPTION_REGEXP = /^\-/;
const YARN_REGEXP = /yarn/;
const PACKAGE_REGEXP = /^((@[a-z_-]+\/)?[a-z_-]+)(@(.*))?$/;

const isYarn = YARN_REGEXP.test(process.env.npm_execpath);
const args = process.argv.slice(2);
const alliageInstallArgs = !isYarn
  ? "run alliage:install -- {package}"
  : "alliage:install {package}";

spawnSync(process.env.npm_execpath, [isYarn ? "add" : "install", ...args], {
  stdio: "inherit",
});

const packages = args
  .filter((arg) => !OPTION_REGEXP.test(arg))
  .map((package) => {
    const res = PACKAGE_REGEXP.exec(package);
    return res[1];
  });

packages.forEach((package) => {
  spawnSync(
    process.env.npm_execpath,
    alliageInstallArgs.replace("{package}", package).split(" "),
    { stdio: "inherit" }
  );
});
