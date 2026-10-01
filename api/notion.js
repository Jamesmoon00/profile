const DATABASE_ID = "3ec699317d0e80cba050db1880d4a4e7";
const NOTION_VERSION = "2022-06-28";

module.exports = async (req, res) => {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    res.status(500).json({ error: "NOTION_TOKEN 환경변수가 설정되지 않았습니다." });
    return;
  }

  try {
    const notionRes = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ page_size: 50 }),
      }
    );

    if (!notionRes.ok) {
      const detail = await notionRes.text();
      res.status(notionRes.status).json({ error: detail });
      return;
    }

    const data = await notionRes.json();
    const items = data.results.map(toItem);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function toItem(page) {
  let title = "";
  const fields = [];

  for (const [name, prop] of Object.entries(page.properties)) {
    switch (prop.type) {
      case "title":
        title = prop.title.map((t) => t.plain_text).join("");
        break;
      case "rich_text": {
        const text = prop.rich_text.map((t) => t.plain_text).join("");
        if (text) fields.push({ name, type: "text", value: text });
        break;
      }
      case "select":
        if (prop.select) fields.push({ name, type: "text", value: prop.select.name });
        break;
      case "status":
        if (prop.status) fields.push({ name, type: "text", value: prop.status.name });
        break;
      case "multi_select":
        if (prop.multi_select.length)
          fields.push({
            name,
            type: "multi",
            value: prop.multi_select.map((s) => s.name),
          });
        break;
      case "date":
        if (prop.date) fields.push({ name, type: "text", value: prop.date.start });
        break;
      case "checkbox":
        fields.push({ name, type: "text", value: prop.checkbox ? "✓" : "—" });
        break;
      case "number":
        if (prop.number !== null)
          fields.push({ name, type: "text", value: String(prop.number) });
        break;
      case "url":
        if (prop.url) fields.push({ name, type: "text", value: prop.url });
        break;
      default:
        break;
    }
  }

  return { id: page.id, url: page.url, title, fields };
}
