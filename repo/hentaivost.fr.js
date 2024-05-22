// ==MiruExtension==
// @name        HentaiVostfr
// @version     v0.0.1
// @author      Grand_K
// @lang        fr
// @license     MIT
// @icon        https://hentaivost.fr/wp-content/uploads/2016/03/Favicon.png
// @package     hentaivost.fr
// @type        bangumi
// @webSite     https://hentaivost.fr/
// ==/MiruExtension==

export default class extends Extension {
    async latest(page) {
      const res = await this.request(`/hp/hentai-video/page${page}/`);
      const bsxList = await this.querySelectorAll(res, "article.cactus-post-item");
      const novel = [];
      for (const element of bsxList) {
        const html = await element.content;
        const url = await this.getAttributeText(html, "a", "href");
        const title = await this.querySelector(html, "title").text;
        const cover = await this.querySelector(html, "img").getAttributeText("src");
        novel.push({
          title: title.trim(),
          url,
          cover,
        });
      }
      return novel;
    }
  
    async search(kw) {
      const res = await this.request(`/?s=${kw}`);
      const bsxList = await this.querySelectorAll(res, "article.cactus-post-item");
      const novel = [];
  
      for (const element of bsxList) {
        const html = await element.content;
        const url = await this.getAttributeText(html, "a", "href");
        const title = await this.querySelector(html, "title").text;
        const cover = await this.querySelector(html, "img").getAttributeText("src");
        novel.push({
          title,
          url,
          cover,
        });
      }
      return novel;
    }
  
    async detail(url) {
      const res = await this.request("", {
        headers: {
          "Miru-Url": url,
        },
      });
  
      const title = await this.querySelector(res, "li.name").text;
      const cover = await this.querySelector(res, "img.imagenewshentai").getAttributeText("src");
      const desc = await this.querySelector(res, "div.descriptioninfoh").text;
      const urlPatterns = [/https?:\/\/[^\s'"]+\.(?:mp4|m3u8)/];
  
      let episodeUrl = "";
  
      for (const pattern of urlPatterns) {
        const match = res.match(pattern);
        if (match) {
          episodeUrl = match[0];
          break;
        }
      }
  
      return {
        title: title.trim(),
        cover,
        desc,
        episodes: [
          {
            title: "Directory",
            urls: [
              {
                name: title,
                url: episodeUrl,
              },
            ],
          },
        ],
      };
    }
  
    async watch(url) {
      return {
        type: "hls",
        url: url || "",
      };
    }
  }