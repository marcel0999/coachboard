export async function resolve(specifier, context, nextResolve) {
  if (
    specifier.startsWith('.') &&
    !specifier.endsWith('.js') &&
    !specifier.endsWith('.jsx') &&
    !specifier.endsWith('.json') &&
    !specifier.endsWith('.mjs')
  ) {
    try {
      return await nextResolve(`${specifier}.js`, context)
    } catch {
      /* fall through to default resolver */
    }
  }

  return nextResolve(specifier, context)
}
