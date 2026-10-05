/* 知否知否 · 访问次数统计接口（Vercel 云函数）
   作用：被页面底部的计数脚本（js/visits.js）调用。
   - /api/hit?count=1  ：今日访问 +1、累计访问 +1，并返回两个数字
   - /api/hit          ：只读取，不增加
   数据存在 Vercel 里关联的 Upstash Redis 数据库，只存两类数字，不存任何个人信息：
   zf:total（累计）、zf:day:日期（当天，按北京时间算，保留 120 天后自动清掉）。
   环境变量由 Vercel 在“关联数据库”时自动添加，这里兼容常见的几种名字。 */
const URL_ENV = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.STORAGE_REST_API_URL;
const TOKEN_ENV = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.STORAGE_REST_API_TOKEN;

function today() {                       /* 北京时间的日期，如 2026-10-05 */
  return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
}

async function redis(commands) {          /* 一次发多条命令，返回每条的结果 */
  const r = await fetch(URL_ENV.replace(/\/$/, '') + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN_ENV, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands)
  });
  if (!r.ok) throw new Error('redis ' + r.status);
  const out = await r.json();
  return out.map(function (x) { return x.result; });
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!URL_ENV || !TOKEN_ENV) { res.statusCode = 503; res.end('{"error":"not configured"}'); return; }
  try {
    const dayKey = 'zf:day:' + today();
    const q = (req.query && req.query.count) || new URL(req.url, 'http://x').searchParams.get('count');
    let r;
    if (q === '1' && req.method !== 'HEAD') {
      r = await redis([['INCR', 'zf:total'], ['INCR', dayKey], ['EXPIRE', dayKey, 60 * 60 * 24 * 120]]);
      res.end(JSON.stringify({ total: Number(r[0]), today: Number(r[1]) }));
    } else {
      r = await redis([['GET', 'zf:total'], ['GET', dayKey]]);
      res.end(JSON.stringify({ total: Number(r[0] || 0), today: Number(r[1] || 0) }));
    }
  } catch (e) {
    res.statusCode = 500;
    res.end('{"error":"failed"}');
  }
};
