import https from "https";

import * as cheerio from "cheerio";

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

const getPosts = (url: string): Promise<Post[]> =>
  get("https://www.torrentmac.net" + url).then((data) => {
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

export const getRecentPosts = (): Promise<Post[]> => getPosts("/");
export const searchPosts = (s: string): Promise<Post[]> =>
  getPosts("/?s=" + encodeURIComponent(s));

export const getTorrent = (url: string): Promise<string | undefined> =>
  get(url).then((data) => {
    const $ = cheerio.load(data);
    const downloatBtn = $(".download-btn");
    return downloatBtn.attr("href")?.trim();
  });
