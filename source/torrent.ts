import { exec } from "child_process";
import { join } from "path";
import https from "https";
import fs from "fs";

import downloadsFolder from "downloads-folder";

export const downloadTorrent = (torrent: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const path = join(
      downloadsFolder(),
      torrent.substring(torrent.lastIndexOf("/") + 1)
    );

    const file = fs.createWriteStream(path);

    https.get(torrent, (res) => {
      res.pipe(file);

      file.on("finish", () => {
        file.close();
        resolve(path);
      });

      res.on("error", (err) => {
        reject(err);
      });
    });
  });

export const openTorrent = (path: string | undefined) => exec(`open ${path}`);
