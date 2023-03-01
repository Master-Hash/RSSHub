// @ts-check

const { weapiEncrypt } = require('./utils.js');

// const buildData = require("@/utils/common-config.js");
const got = require('@/utils/got.js');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const form = await weapiEncrypt(
        JSON.stringify({
            seriesId: String(id),
            limit: '40',
        })
    );
    const link = `https://music.163.com/topic/all?seriesId=${id}`;

    const [{ data: dataAPI }, { data }] = await Promise.all([
        got({
            method: 'post',
            url: 'https://music.163.com/weapi/topic/all',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: new URLSearchParams(form).toString(),
        }),
        got({
            method: 'get',
            url: link,
        }),
    ]);

    const $ = cheerio.load(data);
    const list = $('ul.m-tpclst').find('li');
    const title = $('h3 > span').text();
    const author = dataAPI.data[0].creator.nickname;
    const description = $('p.desc').text();

    ctx.state.data = {
        title,
        link,
        description,
        item: list
            .map((i, el) => {
                const a = dataAPI.data[i];

                const title = a.title;
                const link = 'https://music.163.com' + $(el).find('h4 > a').attr('href');
                const date = new Date(a.addTime);
                const comments = a.commentCount;
                const upvotes = a.likedCount;
                const img = new URL($(el).find('img').attr('src'));
                img.search = '';
                img.protocol = 'https:';
                return {
                    title,
                    author,
                    description: `<p>${a.summary}</p><img src="${img.href}">`,
                    link,
                    pubDate: new Date(date),
                    published: new Date(date),
                    upvotes,
                    comments,
                };
            })
            .get(),
    };
};
