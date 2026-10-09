export function isDoc<T>(doc: any): doc is T {
  return doc !== null && typeof doc === 'object'
}