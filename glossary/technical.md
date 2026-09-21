| Term | Definition | Use When | Avoid |
| --- | --- | --- | --- |
| logical id | A stable key that identifies a crawl independently of its storage location. | Describing the key passed to `getCrawl(id)`. | Equating an id with a file path. |
| provider | The boundary that retrieves a crawl, validates its identity, and returns a named outcome. | Describing `CrawlProvider` and its implementation. | Assigning rendering or palette resolution to this boundary. |
| identity | A crawl's id, required title, and optional date and color. | Describing the data checked at the provider boundary. | Implying that type checks interpret authored values. |
| definition | The crawl content carried through the provider for domain layers and views to interpret. | Describing the content separate from identity and device state. | Treating a found result as proof of valid definition content. |
