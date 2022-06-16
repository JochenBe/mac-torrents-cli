import https from "https";
import path from "path";
import dns from "dns";

import * as cheerio from "cheerio";

const domain = "www.torrentmac.net";
const url = `https://${domain}`;

export const lookup = (): Promise<void> =>
  new Promise((resolve, reject) => {
    dns.lookup(domain, (err) => {
      if (err) reject();
      else resolve();
    });
  });

const get = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve(data);
      });

      res.on("error", (err) => {
        reject(err);
      });
    });
  });

export type Post = {
  title: string;
  href: string;
};

export const getTopPosts = (): Promise<Post[]> =>
  get(url).then((data) => {
    let posts: Post[] = [];

    const $ = cheerio.load(data);
    $(".wpp-post-title").each((_, pt) => {
      const postTitle = $(pt);

      const title = postTitle.text().trim();
      if (title == "") return;

      const href = postTitle.attr("href")?.trim();
      if (!href) return;

      posts.push({ title, href });
    });

    return posts;
  });

export const getRecentPosts = (): Promise<Post[]> =>
  get(url).then((data) => {
    let posts: Post[] = [];

    const $ = cheerio.load(data);
    $(".post-title-small a").each((_, pt) => {
      const postTitle = $(pt);

      const title = postTitle.attr("title")?.trim();
      if (!title) return;

      const href = postTitle.attr("href")?.trim();
      if (!href) return;

      posts.push({ title, href });
    });

    return posts;
  });

export const searchPosts = (s: string): Promise<Post[]> =>
  get(path.join(url, "/?s=" + encodeURIComponent(s))).then((data) => {
    let posts: Post[] = [];

    const $ = cheerio.load(data);
    $(".post-title a").each((_, pt) => {
      const postTitle = $(pt);

      const title = postTitle.attr("title")?.trim();
      if (!title) return;

      const href = postTitle.attr("href")?.trim();
      if (!href) return;

      posts.push({ title, href });
    });

    return posts;
  });

export const getTorrent = (url: string): Promise<string | undefined> =>
  get(url).then((data) => {
    const $ = cheerio.load(data);
    return $(".download-btn").attr("href")?.trim();
  });
