// ==MiruExtension==
// @name        PhoenixScans
// @version     v0.0.1
// @author      Grand_K
// @lang        fr
// @license     MIT
// @icon        https://phenixscans.fr/wp-content/uploads/2023/05/cropped-Calque-1-32x32.png
// @package     phenixscans.fr
// @type        manga
// @webSite     https://phenixscans.fr/
// ==/MiruExtension==

export default class extends Extension {

  async req(url) {
    return this.request(url, {
      headers: {
        "Miru-Url": await this.getSetting("phenixscans"),
      },
    });
  }

  async load() {
    this.registerSetting({
      title: "PhenixScans Base URL",
      key: "phenixscans",
      type: "input",
      desc: "This is the URL where the comics are fetched from",
      defaultValue: "https://phenixscans.fr/",
    });
  }

  async latest(page) {
    let res = await this.req(`/manga/?page=${page}&order=update`);

      let items = await this.querySelectorAll(res, "div.listupd > div.bs > div.bsx");

      let respItems = await Promise.all(items.map(async (item) => ({
          url: await this.getAttributeText(item.content, "a", "href"),
          cover: await this.getAttributeText(item.content, "img", "src"),
          title: await this.getAttributeText(item.content, "a", "title")
      })))

      return respItems
  }
  async search(kw, page) {
    let res = await this.req(`/page/${page}/?s=${kw}`);

      let items = await this.querySelectorAll(res, "div.listupd > div.bs > div.bsx");

      let respItems = await Promise.all(items.map(async (item) => ({
          url: await this.getAttributeText(item.content, "a", "href"),
          cover: await this.getAttributeText(item.content, "img", "src"),
          title: await this.getAttributeText(item.content, "a", "title")
      })))

      return respItems;
  }
  async detail(url) {
    let res  = await this.request('',{
        headers: {
            "Miru-Url": url,
        }
    })

    let title = await this.querySelector(res, "title").text
    const cover = await this.querySelector(res, "img.wp-post-image").getAttributeText("src");

    const desclist = await this.querySelectorAll(res, "div.entry-content.entry-content-single > p");
    const desc = await Promise.all(desclist.map(async (element) => {
        const decHtml = await element.content;
        return await this.querySelector(decHtml, "p").text;
    })).then((texts) => texts.join(""));

    const epiList = await this.querySelectorAll(res, "#chapterlist > ul > li");
    const episodes = await Promise.all(epiList.map(async (element) => {
        const html = await element.content;
        const name = (await this.querySelector(html, "span.chapternum").text).trim().replace(/[\n\t]/g, '');;
        const url = await this.getAttributeText(html, "a", "href");
        return {
            name,
            url: url,
        };
    }));

    return {
        title,
        cover,
        desc,
        episodes: [
            {
                title: "Chapitres",
                urls: episodes,
            },
        ],
    };
  }
  async watch() {
    const res = await this.request("", {
        headers: {
            "Miru-Url": url,
        },
    });

    const images = await Promise.all((await this.querySelectorAll(res, "div#readerarea > img")).map(async (element) => {
        const html = await element.content;
        return this.getAttributeText(html, "img", "src");
    }));

    return {
        urls: images,
    };
  }
}