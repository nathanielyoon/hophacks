type Where = [string, "=" | "<" | "<=" | ">" | ">=", string][];
type Xata = { XATA_URL: string; XATA_KEY: string };
export const insert = (env: Xata, table: string, row: Record<string, string>) =>
  fetch(`${env.XATA_URL}/tables/${table}/data`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.XATA_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(row),
  }).then((A) => A.status);
const statement = (table: string, where: Where) => {
  let sql = `SELECT * FROM ${table} WHERE `, condition, z = 0;
  do sql += `"${(condition = where[z])[0]}" ${condition[1]} '${
    condition[2]
      .replaceAll('"', '\\"').replaceAll("'", "\\'").replaceAll("\n", "\\n")
      .replaceAll("\r", "\\r").replaceAll("\t", "\\t").replaceAll("\\", "\\\\")
      .replaceAll("\0", "\\0").replaceAll("\b", "\\b").replaceAll("\x1a", "\\Z")
  }' AND `; while (++z < where.length);
  return sql.slice(0, -5);
};
export const select = (env: Xata, table: string, where: Where) =>
  fetch(`${env.XATA_URL}/sql`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.XATA_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ statement: statement(table, where) }),
  }).then((response) => response.ok ? response.json() : response.status)
    .then((result) => {
      if (typeof result === "number") return result;
      const records = result.records;
      const length = records.length;
      const header: string[] = [];
      const rows = Array<string[]>(length);
      const columns = Object.keys(result.columns);
      for (let z = 0; z < columns.length; ++z) {
        if (/^(?!xata)(\w+)$/.test(columns[z])) header.push(columns[z]);
      }
      const headers = header.length;
      for (let z = 0; z < length; ++z) {
        const record = records[z];
        rows[z] = Array(headers);
        for (let y = 0; y < headers; ++y) rows[z][y] = record[header[y]];
      }
      return rows;
    });
