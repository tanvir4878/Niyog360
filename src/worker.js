const enc = new TextEncoder();
const J = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json;charset=utf-8', 'cache-control': 'no-store' } });
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
async function sign(env, t) {
  const k = await crypto.subtle.importKey('raw', enc.encode(env.ADMIN_PASSWORD), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', k, enc.encode(t)));
}
async function authed(req, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const [e, s] = (req.headers.get('authorization') || '').replace('Bearer ', '').split('.');
  return !!(e && s && Date.now() < +e && s === await sign(env, e));
}
const FIELDS = ['title','org','category','vacancies','location','salary','education','experience','age_limit','deadline','description','how_to_apply','apply_url','image_url','circular_images','featured','urgent','status'];
function clean(b) {
  const o = {};
  for (const k of FIELDS) {
    let v = b[k];
    if (k === 'circular_images') v = JSON.stringify(Array.isArray(v) ? v.slice(0, 20) : []);
    else if (k === 'featured' || k === 'urgent') v = v ? 1 : 0;
    else v = v == null ? '' : String(v).trim();
    o[k] = v;
  }
  if (o.status !== 'draft') o.status = 'published';
  return o;
}
const out = r => ({ ...r, circular_images: JSON.parse(r.circular_images || '[]') });

async function list(u, env, admin) {
  const q = u.searchParams, w = [], a = [];
  if (!admin) w.push("status='published'");
  if (q.get('cat')) { w.push('category=?'); a.push(q.get('cat')); }
  if (q.get('q')) { w.push('(title LIKE ? OR org LIKE ? OR description LIKE ?)'); const s = '%' + q.get('q') + '%'; a.push(s, s, s); }
  if (q.get('active') === '1') w.push("(deadline='' OR deadline>=date('now'))");
  if (q.has('ids')) {
    const ids = q.get('ids').split(',').map(Number).filter(Boolean).slice(0, 100);
    if (!ids.length) return J({ items: [], total: 0, page: 1, pages: 1 });
    w.push(`id IN (${ids.map(() => '?').join()})`); a.push(...ids);
  }
  const W = w.length ? 'WHERE ' + w.join(' AND ') : '';
  const ord = { deadline: "CASE WHEN deadline='' THEN 1 ELSE 0 END, deadline ASC", views: 'views DESC' }[q.get('sort')] || 'id DESC';
  const lim = Math.min(+q.get('limit') || 12, 50), pg = Math.max(+q.get('page') || 1, 1);
  const tot = (await env.DB.prepare(`SELECT COUNT(*) c FROM jobs ${W}`).bind(...a).first()).c;
  const { results } = await env.DB.prepare(`SELECT id,title,org,category,vacancies,location,deadline,image_url,featured,urgent,status,views,created_at FROM jobs ${W} ORDER BY ${ord} LIMIT ? OFFSET ?`).bind(...a, lim, (pg - 1) * lim).all();
  return J({ items: results, total: tot, page: pg, pages: Math.max(Math.ceil(tot / lim), 1) });
}

export default {
  async fetch(req, env, ctx) {
    const u = new URL(req.url), p = u.pathname, m = req.method;
    let x;
    try {
      if (p === '/api/jobs') return await list(u, env, false);
      if (p === '/api/stats') {
        const { results } = await env.DB.prepare("SELECT category, COUNT(*) c FROM jobs WHERE status='published' AND (deadline='' OR deadline>=date('now')) GROUP BY category").all();
        const cats = {}; results.forEach(r => cats[r.category] = r.c);
        return J({ cats });
      }
      if ((x = p.match(/^\/api\/jobs\/(\d+)$/))) {
        const r = await env.DB.prepare("SELECT * FROM jobs WHERE id=? AND status='published'").bind(x[1]).first();
        if (!r) return J({ error: 'বিজ্ঞপ্তিটি পাওয়া যায়নি' }, 404);
        ctx.waitUntil(env.DB.prepare('UPDATE jobs SET views=views+1 WHERE id=?').bind(x[1]).run());
        return J(out(r));
      }
      if ((x = p.match(/^\/img\/([\w.-]+)$/))) {
        const o = await env.BUCKET.get(x[1]);
        if (!o) return new Response('Not found', { status: 404 });
        return new Response(o.body, { headers: { 'content-type': o.httpMetadata?.contentType || 'image/jpeg', 'cache-control': 'public,max-age=31536000,immutable' } });
      }
      if (p === '/sitemap.xml') {
        const { results } = await env.DB.prepare("SELECT id,created_at FROM jobs WHERE status='published' ORDER BY id DESC LIMIT 2000").all();
        const b = u.origin;
        return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${b}/</loc></url>${results.map(r => `<url><loc>${b}/job?id=${r.id}</loc><lastmod>${r.created_at.slice(0, 10)}</lastmod></url>`).join('')}</urlset>`, { headers: { 'content-type': 'application/xml' } });
      }
      if (p === '/api/admin/login' && m === 'POST') {
        const b = await req.json().catch(() => ({}));
        if (!env.ADMIN_PASSWORD || b.password !== env.ADMIN_PASSWORD) { await new Promise(r => setTimeout(r, 800)); return J({ error: 'ভুল পাসওয়ার্ড' }, 401); }
        const e = Date.now() + 6048e5;
        return J({ token: e + '.' + await sign(env, String(e)) });
      }
      if (p.startsWith('/api/admin/')) {
        if (!await authed(req, env)) return J({ error: 'unauthorized' }, 401);
        if (p === '/api/admin/jobs' && m === 'GET') return await list(u, env, true);
        if (p === '/api/admin/jobs' && m === 'POST') {
          const o = clean(await req.json());
          if (!o.title || !o.category) return J({ error: 'শিরোনাম ও ক্যাটাগরি আবশ্যক' }, 400);
          const ks = Object.keys(o);
          const r = await env.DB.prepare(`INSERT INTO jobs(${ks}) VALUES(${ks.map(() => '?')})`).bind(...ks.map(k => o[k])).run();
          return J({ id: r.meta.last_row_id }, 201);
        }
        if (p === '/api/admin/upload' && m === 'POST') {
          const f = (await req.formData()).get('file');
          if (!f || !f.type?.startsWith('image/')) return J({ error: 'শুধু ছবি আপলোড করুন' }, 400);
          if (f.size > 8e6) return J({ error: 'ছবি ৮MB এর কম হতে হবে' }, 400);
          const ext = (f.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg').replace(/[^a-z0-9]/g, '');
          const key = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
          await env.BUCKET.put(key, f.stream(), { httpMetadata: { contentType: f.type } });
          return J({ url: '/img/' + key });
        }
        if ((x = p.match(/^\/api\/admin\/jobs\/(\d+)$/))) {
          if (m === 'GET') { const r = await env.DB.prepare('SELECT * FROM jobs WHERE id=?').bind(x[1]).first(); return r ? J(out(r)) : J({ error: 'not found' }, 404); }
          if (m === 'PUT') {
            const o = clean(await req.json());
            if (!o.title || !o.category) return J({ error: 'শিরোনাম ও ক্যাটাগরি আবশ্যক' }, 400);
            const ks = Object.keys(o);
            await env.DB.prepare(`UPDATE jobs SET ${ks.map(k => k + '=?')} WHERE id=?`).bind(...ks.map(k => o[k]), x[1]).run();
            return J({ ok: 1 });
          }
          if (m === 'DELETE') { await env.DB.prepare('DELETE FROM jobs WHERE id=?').bind(x[1]).run(); return J({ ok: 1 }); }
        }
      }
      return J({ error: 'not found' }, 404);
    } catch (e) { return J({ error: 'সার্ভার ত্রুটি: ' + e.message }, 500); }
  }
};
