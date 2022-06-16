#! /usr/bin/env node

import cliSelect from "cli-select";
import chalk from "chalk";

import {
  lookup,
  searchPosts,
  getTopPosts,
  getRecentPosts,
  getTorrent,
  Post,
} from "./mactorrents";
import { downloadTorrent, openTorrent } from "./torrent";

const successChalk = chalk.green;
const progressChalk = chalk.yellow;
const errorChalk = chalk.red;

const selectedChalk = successChalk;
const dateChalk = chalk.gray;

const unselectedSymbol = " ";
const selectedSymbol = selectedChalk("⬇");
const valueRenderer =
  (max: number) =>
  (post: Post, selected: boolean = true) => {
    const title = post.title;
    const date = " ".repeat(max - post.title.length + 1) + post.date;

    return (
      (selected ? selectedChalk(title) : title) +
      (selected ? date : dateChalk(date))
    );
  };

const posts = (posts: Post[]) => {
  if (posts.length == 0) {
    console.log(errorChalk("No posts found."));
    return;
  }

  const vr = valueRenderer(Math.max(...posts.map((p) => p.title.length)));

  cliSelect({
    values: posts,
    selected: selectedSymbol,
    unselected: unselectedSymbol,
    valueRenderer: vr,
  })
    .then(({ value }) => {
      console.log(`${selectedSymbol} ${vr(value)}`);
      console.log(`${progressChalk("⚁")} Fetching torrent file url...`);
      return getTorrent(value.href);
    })
    .then((torrent) => {
      if (!torrent) {
        console.error(errorChalk("Failed to fetch torrent file url."));
        return;
      }

      console.log(`${progressChalk("⚂")} Downloading torrent file...`);
      return downloadTorrent(torrent);
    })
    .then((path) => {
      if (!path) {
        console.error(errorChalk("Failed to download torrent file."));
        return;
      }

      openTorrent(path);
      console.log(`${progressChalk("⚃")} Done.`);
    });
};

const search = (argv: string[]) => {
  if (argv.length == 0) {
    console.error(errorChalk("No search query given."));
    return;
  }

  const s = argv.join(" ");
  console.log(`${progressChalk("⚀")} Searching for "${s}"...`);
  searchPosts(s).then(posts);
};

const top = () => {
  console.log(`${progressChalk("⚀")} Fetching top posts...`);
  getTopPosts().then(posts);
};

const recent = () => {
  console.log(`${progressChalk("⚀")} Fetching recent posts...`);
  getRecentPosts().then(posts);
};

const failedToConnect = () => {
  console.error(errorChalk("Failed to connect to Mac Torrents."));
};

const help = () => {
  console.log(
    `

mac-torrents <command>

Usage:

mac-torrents <query>        Search for posts
mac-torrents search <query> Search for posts
mac-torrents top            Show top posts
mac-torrents recent         Show recent posts
mac-torrents help           Show this help message

  `.trim()
  );
};

lookup()
  .then(() => {
    const argv = process.argv.splice(2);
    if (argv.length == 0 || argv[0] == "help") help();
    else if (argv[0] == "top") top();
    else if (argv[0] == "recent") recent();
    else if (argv[0] == "search") search(argv.slice(1));
    else search(argv);
  })
  .catch(failedToConnect);
