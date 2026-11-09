type SuccessStatus = 200 | 201 | 202;
type JsonContent<R> = R extends { content: { 'application/json': infer B } } ? B : void;

export type ResponseOf<P, Path extends keyof P, M extends keyof P[Path]> =
  P[Path][M] extends { responses: infer R }
    ? [keyof R & SuccessStatus] extends [never]
      ? void
      : { [K in keyof R & SuccessStatus]: JsonContent<R[K]> }[keyof R & SuccessStatus]
    : never;

export type BodyOf<P, Path extends keyof P, M extends keyof P[Path]> =
  P[Path][M] extends { requestBody?: { content: { 'application/json': infer B } } }
    ? B
    : never;

export type QueryOf<P, Path extends keyof P, M extends keyof P[Path]> =
  P[Path][M] extends { parameters: { query?: infer Q } } ? Q : never;

export function fillPath(
  path: string,
  params: Record<string, string | number> = {},
): string {
  return path.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    if (value === undefined) throw new Error(`Paramètre de chemin manquant : ${key}`);
    return encodeURIComponent(String(value));
  });
}