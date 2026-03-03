# 🚀 Deployment Guide - Well-being Survey

This project is optimized for deployment on **Vercel**.

---

## Vercel (Recommended)

### Quick Start

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login:**
```bash
vercel login
```

3. **Deploy Preview:**
```bash
vercel
```

4. **Deploy Production:**
```bash
vercel --prod
```

---

## Features

- ✅ **Automatic HTTPS** - SSL certificates managed automatically
- ✅ **Global CDN** - Fast delivery worldwide
- ✅ **Zero Configuration** - Works out of the box
- ✅ **Custom Domains** - Easy domain setup
- ✅ **Environment Variables** - Secure config management
- ✅ **Analytics** - Built-in performance monitoring
- ✅ **Git Integration** - Auto-deploy on push

---

## Configuration

The project includes `vercel.json` with:

### Clean URLs
```
/ch1 → /ch1.html
/admin → /admin-login.html
```

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Cache Optimization
- Static assets: 1 year cache
- HTML: No cache (always fresh)

---

## Detailed Setup

For comprehensive setup instructions, see:
- [docs/VERCEL_SETUP.md](docs/VERCEL_SETUP.md) - Complete Vercel guide
- [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) - Deployment checklist

---

## GitHub Integration

### Automatic Deployments

1. Connect repository to Vercel
2. Push to `main` branch → Auto-deploy to Production
3. Push to other branches → Deploy Preview
4. Pull Requests → Deploy Preview with unique URL

### Setup

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure settings (optional)
5. Deploy!

---

## Custom Domain

### Add Domain

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS:

**Option 1: CNAME (Recommended)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Option 2: A Record**
```
Type: A
Name: @
Value: 76.76.21.21
```

### SSL Certificate

- ✅ Automatic SSL provisioning
- ✅ Auto-renewal
- ✅ Free Let's Encrypt certificate
- ✅ HTTPS redirect enabled

---

## Environment Variables

Set in Vercel Dashboard:

1. Project Settings → Environment Variables
2. Add variables (if needed):
   - `SUPABASE_URL` (optional)
   - `SUPABASE_ANON_KEY` (optional)

**Note:** This project uses `js/supabase-config.js` for configuration, so environment variables are optional.

---

## Monitoring

### Analytics

Enable Vercel Analytics:
- Page views
- Unique visitors
- Performance metrics
- Core Web Vitals

### Logs

View deployment logs:
```bash
vercel logs [deployment-url]
```

Or in Dashboard:
- Deployments → Select deployment → Logs

---

## Troubleshooting

### 404 Not Found

**Fix:**
1. Check `vercel.json` rewrites
2. Verify file paths
3. Redeploy: `vercel --prod`

### Build Failed

**Fix:**
1. Check `package.json`
2. Clear cache: `vercel --prod --force`
3. Check build logs

### Cache Issues

**Fix:**
```bash
# Force redeploy (bypass cache)
vercel --prod --force
```

---

## Performance Tips

1. **Use CDN** - Vercel handles this automatically
2. **Optimize Images** - Compress before upload
3. **Lazy Load** - Load resources on demand
4. **Enable Compression** - Brotli/Gzip (automatic)

---

## Security Checklist

- [x] HTTPS enabled
- [x] Security headers configured
- [x] Environment variables secured
- [x] Rate limiting implemented (app-level)
- [x] RLS policies enabled (Supabase)

---

## Cost

### Hobby Plan (Free)
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ SSL certificates
- ✅ Custom domains
- ✅ Basic analytics

**This project:** Hobby Plan is sufficient

---

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Vercel Status](https://www.vercel-status.com/)
- [Vercel Discord](https://vercel.com/discord)

---

**Last Updated:** 2025-03-03  
**Version:** 3.1.0
