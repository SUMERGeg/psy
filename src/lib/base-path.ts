export function withBasePath(path: string, basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''): string {
  if (!basePath || !path.startsWith('/') || path.startsWith('//')) return path;
  if (path === basePath || path.startsWith(`${basePath}/`)) return path;
  return `${basePath}${path}`;
}

export function withoutBasePath(path: string, basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''): string {
  if (!basePath) return path;
  if (path === basePath) return '/';
  if (path.startsWith(`${basePath}/`) || path.startsWith(`${basePath}?`) || path.startsWith(`${basePath}#`)) {
    const rest = path.slice(basePath.length);
    return rest.startsWith('/') ? rest : `/${rest}`;
  }
  return path;
}
