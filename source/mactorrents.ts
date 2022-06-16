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
  date: string;
};

export const getTopPosts = (): Promise<Post[]> =>
  get(url).then((data) => {
    let posts: Post[] = [];

    const $ = cheerio.load(data);
    $(".wpp-list li").each((_, p) => {
      const post = $(p);

      const a = post.find(".wpp-post-title");

      const title = a.text().trim();
      if (title == "") return;

      const href = a.attr("href")?.trim();
      if (!href) return;

      const date = post.find(".wpp-date").text().slice(10).trim();
      if (!date) return;

      posts.push({ title, href, date });
    });

    return posts;
  });

export const getRecentPosts = (): Promise<Post[]> =>
  get(url).then((data) => {
    let posts: Post[] = [];

    const $ = cheerio.load(data);
    $(".type-3").each((_, p) => {
      const post = $(p);

      const a = post.find(".post-title-small a");

      const title = a.attr("title")?.trim();
      if (!title) return;

      const href = a.attr("href")?.trim();
      if (!href) return;

      const date = post.find("time").text().trim();
      if (!date) return;

      posts.push({ title, href, date });
    });

    return posts;
  });

export const searchPosts = (s: string): Promise<Post[]> =>
  get(path.join(url, "/?s=" + encodeURIComponent(s))).then((data) => {
    let posts: Post[] = [];

    const $ = cheerio.load(data);
    $(".default-post").each((_, p) => {
      const post = $(p);

      const a = post.find(".post-title a");

      const title = a.attr("title")?.trim();
      if (!title) return;

      const href = a.attr("href")?.trim();
      if (!href) return;

      const date = post.find("time").text().trim();
      if (!date) return;

      posts.push({ title, href, date });
    });

    return posts;
  });

export const getTorrent = (url: string): Promise<string | undefined> =>
  get(url).then((data) => {
    const $ = cheerio.load(data);
    return $(".download-btn").attr("href")?.trim();
  });
