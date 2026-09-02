import Papa from "papaparse";

export type DataRow = Record<string, string>;

export function parseCsv(text: string): { rows: DataRow[]; fields: string[]; errors: string[] } {
  const result = Papa.parse<DataRow>(text, { header: true, skipEmptyLines: "greedy", transformHeader: (value) => value.trim() });
  const fields = result.meta.fields ?? [];
  return { rows: result.data, fields, errors: result.errors.map((error) => `Row ${error.row ?? "?"}: ${error.message}`) };
}

export function jsonToRows(text: string): { rows: DataRow[]; fields: string[] } {
  const value: unknown = JSON.parse(text);
  const values = Array.isArray(value) ? value : [value];
  if (!values.every((item) => item && typeof item === "object" && !Array.isArray(item))) throw new Error("JSON must be an object or an array of objects.");
  const fields = [...new Set(values.flatMap((item) => Object.keys(item as Record<string, unknown>)))];
  const rows = values.map((item) => Object.fromEntries(fields.map((field) => {
    const cell = (item as Record<string, unknown>)[field];
    return [field, cell == null ? "" : typeof cell === "object" ? JSON.stringify(cell) : String(cell)];
  })));
  return { rows, fields };
}

export function rowsToCsv(rows: DataRow[], fields?: string[]) { return Papa.unparse(rows, { columns: fields }); }

export function mergeTables(tables: { rows: DataRow[]; fields: string[] }[]) {
  const fields = [...new Set(tables.flatMap((table) => table.fields))];
  return { fields, rows: tables.flatMap((table) => table.rows.map((row) => Object.fromEntries(fields.map((field) => [field, row[field] ?? ""])))) };
}

export function splitRows(rows: DataRow[], size: number) {
  if (!Number.isInteger(size) || size < 1) throw new Error("Rows per file must be at least 1.");
  return Array.from({ length: Math.ceil(rows.length / size) }, (_, index) => rows.slice(index * size, (index + 1) * size));
}

export function deduplicateRows(rows: DataRow[], columns: string[]) {
  if (!columns.length) throw new Error("Select at least one column.");
  const seen = new Set<string>();
  const duplicateIndexes: number[] = [];
  const unique = rows.filter((row, index) => {
    const key = JSON.stringify(columns.map((column) => row[column] ?? ""));
    if (seen.has(key)) { duplicateIndexes.push(index); return false; }
    seen.add(key); return true;
  });
  return { unique, duplicateIndexes };
}

export function selectColumns(rows: DataRow[], columns: string[]) {
  return rows.map((row) => Object.fromEntries(columns.map((column) => [column, row[column] ?? ""])));
}
