// Convert MkDocs-style admonitions to Docusaurus admonitions.
//
// MkDocs:
//   !!!warning "Title"
//
//       body line 1
//       body line 2
//
// Docusaurus:
//   :::warning[Title]
//
//   body line 1
//   body line 2
//
//   :::
import { readdir, readFile, writeFile, stat } from "node:fs/promises"
import { join } from "node:path"

const TYPE_MAP = {
  note: "note",
  tip: "tip",
  tips: "tip",
  info: "info",
  warning: "warning",
  danger: "danger",
  caution: "warning",
  important: "info",
}

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir)) {
    const p = join(dir, entry)
    const s = await stat(p)
    if (s.isDirectory()) out.push(...(await walk(p)))
    else if (p.endsWith(".md") || p.endsWith(".mdx")) out.push(p)
  }
  return out
}

function convert(source) {
  const lines = source.split("\n")
  const out = []
  let i = 0
  let changed = false

  const header = /^!!!\s*([a-zA-Z]+)\s*(?:"([^"]*)")?\s*$/

  while (i < lines.length) {
    const m = lines[i].match(header)
    if (!m) {
      out.push(lines[i])
      i++
      continue
    }

    changed = true
    const rawType = m[1].toLowerCase()
    const type = TYPE_MAP[rawType] || "note"
    const title = m[2] ? m[2].trim() : ""
    i++

    // skip blank line(s) directly after the header
    while (i < lines.length && lines[i].trim() === "") i++

    // collect indented body (4+ spaces or tab) — allow blank lines inside
    const body = []
    while (i < lines.length) {
      const line = lines[i]
      if (line.trim() === "") {
        body.push("")
        i++
        continue
      }
      if (line.startsWith("    ") || line.startsWith("\t")) {
        body.push(line.startsWith("\t") ? line.slice(1) : line.slice(4))
        i++
        continue
      }
      break
    }

    // strip trailing blank lines from body
    while (body.length && body[body.length - 1] === "") body.pop()

    out.push(title ? `:::${type}[${title}]` : `:::${type}`)
    out.push("")
    for (const b of body) out.push(b)
    out.push("")
    out.push(":::")
    out.push("")
  }

  return { text: out.join("\n"), changed }
}

const root = process.argv[2] || "docs"
const files = await walk(root)
let touched = 0
for (const f of files) {
  const src = await readFile(f, "utf8")
  const { text, changed } = convert(src)
  if (changed) {
    await writeFile(f, text)
    touched++
    console.log("converted:", f)
  }
}
console.log(`\nDone. ${touched} file(s) converted out of ${files.length}.`)
