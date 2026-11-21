# চাকরির খবর — Job Portal (Cloudflare Worker + D1 + R2)

public/   -> ওয়েবসাইট (index.html, job.html, admin.html, style.css, common.js)
src/worker.js -> API + অ্যাডমিন লগইন + ছবি আপলোড
schema.sql    -> ডাটাবেস টেবিল (D1 Console এ রান করুন)
wrangler.jsonc -> Cloudflare কনফিগ (database_id বসাতে হবে)

Secret: ADMIN_PASSWORD (Cloudflare Dashboard > Worker > Settings > Variables and Secrets)
Admin: https://আপনার-সাইট/admin
