// ==MiruExtension==
// @name         PhenixScans
// @version      v0.1
// @author       Grand_K
// @lang         fr
// @license      MIT
// @icon         https://pbs.twimg.com/profile_images/1663318721878794247/bjV3Wrx4_400x400.jpg
// @package      phenixscans.fr
// @type         manga
// @webSite      https://phenixscans.fr/
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
            defaultValue: "https://phenixscans.fr",
        });

        //Use From Asuratoon.com Extension
        this.registerSetting({
            title: "Reverse Order of Chapters",
            key: "reverseChaptersOrder",
            type: "toggle",
            description: "Reverse the order of chapters in ascending order",
            defaultValue: "true",
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
        // Implement the detail method to get details of a specific comic
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
            const name = (await this.querySelector(html, "span.chapternum").text).trim().replace(/[\n\t]/g, '');
            const url = await this.getAttributeText(html, "a", "href");
            return {
                name,
                url: url,
            };
        }));

        //Use From Asuratoon.com Extension
        if (await this.getSetting("reverseChaptersOrder") === "true") {
            episodes.reverse();
        }

        return {
            title,
            cover,
            desc,
            episodes: [
                {
                    title: "Chapitres",
                    url: episodes,
                },
            ],
        };
    }

    async watch(url) {
        const res = await this.request("", {
            headers: {
                "Miru-Url": url,
            },
        });

        const images = await Promise.all((await this.querySelectorAll(res, "div#readerarea > img")).map(async (element) => {
            const html = await element.content;
            return this.getAttributeText(html, "img", "data-src");
        }));

        return {
            urls: images,
        };
    }
}
