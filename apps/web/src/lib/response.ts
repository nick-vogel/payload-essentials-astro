// A plain-text body, one line per entry and a trailing newline, served as the given content type.
export function linesResponse(lines: string[], contentType: string): Response {
  return new Response([...lines, ''].join('\n'), { headers: { 'Content-Type': contentType } })
}
