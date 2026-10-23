// GitHub Pages のサブパス配信でもリンクが切れないよう、BASE_URL を前に付ける
export function link(path: string): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '') + path;
}
