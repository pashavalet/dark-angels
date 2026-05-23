import { admins, tours, services, blogArticles, homepageCollections } from './mock-data.js';
import { randomUUID } from 'node:crypto';

const refreshTokens: any[] = [];

function filterEq<T>(items: T[], field: string, value: any): T[] {
  return items.filter((item: any) => item[field] === value);
}

function mockQuery<T>(items: T[], table: string): any {
  let filtered: T[] = [...items];
  let orderField: string | null = null;
  let orderAsc = true;
  let limitCount: number | null = null;
  let offsetVal: number | null = null;
  let singleResult = false;
  let countExact = false;

  let _updateData: any = null;
  let _deleteFlag = false;
  let _insertData: any = null;

  const chain: any = {
    select(_fields: string, opts?: { count?: string }) {
      if (opts?.count === 'exact') countExact = true;
      return chain;
    },
    eq(field: string, value: any) {
      filtered = filterEq(filtered, field, value);
      return chain;
    },
    in(field: string, values: any[]) {
      filtered = filtered.filter((item: any) => values.includes(item[field]));
      return chain;
    },
    or(_query: string) {
      return chain;
    },
    contains(_field: string, _values: any[]) {
      return chain;
    },
    order(field: string, opts?: { ascending?: boolean }) {
      orderField = field;
      orderAsc = opts?.ascending ?? true;
      return chain;
    },
    range(from: number, to: number) {
      offsetVal = from;
      limitCount = to - from + 1;
      return chain;
    },
    limit(n: number) {
      limitCount = n;
      return chain;
    },
    single() {
      singleResult = true;
      return chain;
    },
    insert(newItems: any[], _opts?: any) {
      _insertData = Array.isArray(newItems) ? newItems : [newItems];
      return chain;
    },
    update(data: any) {
      _updateData = data;
      return chain;
    },
    delete(_opts?: any) {
      _deleteFlag = true;
      return chain;
    },
    then(resolve: any, _reject: any) {
      // Execute mutations first
      if (_deleteFlag) {
        const deleted = [...filtered];
        const remaining = (items as any[]).filter((item: any) => !deleted.includes(item));
        (items as any[]).length = 0;
        (items as any[]).push(...remaining);
        resolve({ data: null, error: null });
        return;
      }
      if (_updateData) {
        filtered.forEach((item: any) => Object.assign(item, _updateData, { updated_at: new Date().toISOString() }));
        resolve({ data: filtered.length === 1 ? filtered[0] : filtered, error: null });
        return;
      }
      if (_insertData) {
        const inserted = _insertData.map((it: any) => ({
          ...it, id: randomUUID(), created_at: new Date().toISOString(),
        }));
        (items as any[]).push(...inserted);
        resolve({ data: _insertData.length === 1 ? inserted[0] : inserted, error: null });
        return;
      }

      // Query resolution
      let result = [...filtered];
      if (orderField) {
        result.sort((a: any, b: any) => {
          const va = a[orderField!] ?? 0;
          const vb = b[orderField!] ?? 0;
          return orderAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
        });
      }
      const total = result.length;
      if (offsetVal !== null && limitCount !== null) {
        result = result.slice(offsetVal, offsetVal + limitCount);
      } else if (limitCount !== null) {
        result = result.slice(0, limitCount);
      }
      if (singleResult) {
        const item = result[0] ?? null;
        resolve({ data: item, error: item ? null : { code: 'PGRST116' }, count: countExact ? 1 : undefined });
      } else {
        resolve({ data: result, error: null, count: countExact ? total : undefined });
      }
    },
  };
  return chain;
}

export function createMockSupabase() {
  const storageFiles = new Map<string, Buffer>();

  const supabase: any = {
    from(table: string) {
      const map: Record<string, any[]> = {
        admins: admins,
        tours: tours,
        services: services,
        blog_articles: blogArticles,
        homepage_collections: homepageCollections,
        refresh_tokens: refreshTokens,
      };
      return mockQuery(map[table] ?? [], table);
    },
    storage: {
      from(bucket: string) {
        return {
          upload(filename: string, buffer: Buffer, _opts?: any) {
            storageFiles.set(`${bucket}/${filename}`, buffer);
            return Promise.resolve({ data: { path: filename }, error: null });
          },
          getPublicUrl(filename: string) {
            return { data: { publicUrl: `https://mock-storage.local/${bucket}/${filename}` } };
          },
          remove(filenames: string[]) {
            for (const f of filenames) storageFiles.delete(`${bucket}/${f}`);
            return Promise.resolve({ data: null, error: null });
          },
        };
      },
    },
  };
  return supabase;
}