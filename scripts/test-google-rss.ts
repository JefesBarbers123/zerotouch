
import Parser from 'rss-parser';

const MOCK_GOOGLE_XML = `
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>Google Alert - Barber</title>
<entry>
    <id>tag:google.com,2005:reader/item/123456789</id>
    <title type="html">Senior &lt;b&gt;Barber&lt;/b&gt; Wanted</title>
    <link href="https://www.google.com/url?rct=j&amp;sa=t&amp;url=https://example.com/job/barber&amp;ct=ga&amp;cd=CAIyGm..." />
    <published>2023-10-27T10:00:00Z</published>
    <updated>2023-10-27T10:00:00Z</updated>
    <content type="html">We are looking for a &lt;b&gt;Barber&lt;/b&gt; to join our team in London...</content>
    <author><name/></author>
</entry>
</feed>
`;

async function test() {
    const parser = new Parser();
    const feed = await parser.parseString(MOCK_GOOGLE_XML);

    feed.items.forEach(item => {
        console.log("--- Item ---");
        console.log("Title:", item.title);
        console.log("Link:", item.link);
        console.log("Content:", item.content);

        // Test logic for cleaning
        const cleanTitle = item.title?.replace(/<\/?[^>]+(>|$)/g, "") || "";
        console.log("Clean Title:", cleanTitle);

        const realUrlMatch = item.link?.match(/[?&]url=([^&]+)/);
        const realUrl = realUrlMatch ? decodeURIComponent(realUrlMatch[1]) : item.link;
        console.log("Extracted URL:", realUrl);
    });
}

test();
