export function getFileName(_filename: string): string {
  if (_filename.includes('?')) {
    // might be useful for the future
    const [actualId] = _filename.split('?')
    return actualId
  }
  return _filename
}
