import { describe, expect, it } from "vitest";
import { deduplicateRows, jsonToRows, mergeTables, parseCsv, selectColumns, splitRows } from "./data-utils";

describe("data utilities", () => {
  it("parses quoted CSV", () => expect(parseCsv('name,note\nAda,"hello, world"').rows[0].note).toBe("hello, world"));
  it("normalizes JSON objects", () => expect(jsonToRows('[{"a":1},{"b":2}]')).toEqual({ fields: ["a", "b"], rows: [{ a: "1", b: "" }, { a: "", b: "2" }] }));
  it("merges mismatched schemas", () => expect(mergeTables([{ fields: ["a"], rows: [{ a: "1" }] }, { fields: ["b"], rows: [{ b: "2" }] }]).rows).toEqual([{ a: "1", b: "" }, { a: "", b: "2" }]));
  it("splits and deduplicates rows", () => { const rows = [{ id: "1" }, { id: "1" }, { id: "2" }]; expect(splitRows(rows, 2)).toHaveLength(2); expect(deduplicateRows(rows, ["id"]).unique).toHaveLength(2); });
  it("keeps only selected columns", () => expect(selectColumns([{ id: "1", email: "a@b.com", city: "Cairo" }], ["id", "city"])).toEqual([{ id: "1", city: "Cairo" }]));
});
