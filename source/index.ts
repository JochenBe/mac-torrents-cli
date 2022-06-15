#! /usr/bin/env node

import cliSelect from "cli-select";
import chalk from "chalk";

import { searchPosts, getTorrent, Post } from "./mactorrents";
import { downloadTorrent, openTorrent } from "./torrent";

const s = process.argv.splice(2).join(" ");

console.log(`Searching for "${s}"...`);

const selected = chalk.green("⬇");
const valueRenderer = (post: Post, selected: boolean = true) =>
  selected ? chalk.green(post.title) : post.title;

searchPosts(s).then((posts) => {
  cliSelect({
    values: posts,
    selected,
    unselected: " ",
    valueRenderer,
  })
    .then(({ value }) => {
      console.log(`${selected} ${valueRenderer(value)}`);
      console.log("Fetching torrent file url...");
      return getTorrent(value.href);
    })
    .then((torrent) => {
      if (!torrent) {
        console.error("Failed to fetch torrent file url");
        return;
      }

      console.log("Downloading torrent file...");
      return downloadTorrent(torrent);
    })
    .then((path) => {
      openTorrent(path);
      console.log("Done.");
    });
});
