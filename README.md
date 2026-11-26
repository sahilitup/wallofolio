# Wallofolio

A public wall of portfolios filtered by business domain: Sales, Marketing, Founder's Office, Chief of Staff, Finance, Consulting, Supply Chain, HR & People, and Others.

- **index.html**: the public wall. Anyone can browse and submit a portfolio.
- **admin.html**: where you approve, reject or delete submissions.
- **Supabase**: the database. New submissions are saved as `pending` and only show on the wall after you approve them.

It's a plain static site (HTML, CSS and JS, with no build step), so you can host it anywhere for free.

## 1. Create the database (about 5 minutes)

1. Sign up at https://supabase.com and create a new project. Pick a region close to your visitors (for India: Mumbai).
2. Open **SQL Editor → New query**. Paste the contents of `supabase/schema.sql` and change `you@example.com` on the last line to your own email. Click **Run**.
3. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key.
4. Paste both into `config.js`:
   ```js
   SUPABASE_URL: "https://xxxx.supabase.co",
   SUPABASE_ANON_KEY: "eyJhbGciOi...",
   ```
   The anon key is safe to publish. The row-level security rules in the schema only let the public read approved portfolios and submit new ones as pending.
5. Open **Authentication → URL Configuration**. Set **Site URL** to your live site address, and add `https://your-site/admin.html` under **Redirect URLs**. This is what makes the admin sign-in link work.

## 2. Put it online

Use any one of these:

- **Netlify Drop** (easiest): go to https://app.netlify.com/drop and drag the whole `domainfolio` folder onto the page.
- **Vercel**: push the folder to GitHub, then go to vercel.com → **Add New → Project** and import the repo. There's no framework and no build command.
- **GitHub Pages**: push the folder to a repo, then turn on Settings → Pages → Deploy from branch.

After it's live, add the real URL to Supabase (step 1.5).

## 3. Run your wall

- Go to `https://your-site/admin.html`, enter your admin email and click the link Supabase emails you.
- Use the **Pending / Approved / Rejected** tabs to review submissions. Click **Approve** to put a portfolio on the wall.
- To add another admin, run this in the SQL Editor: `insert into admins (email) values ('friend@example.com');`

## Demo mode

If `config.js` is left empty, the site shows 26 sample portfolios. These are made-up people and companies. Submissions in demo mode aren't saved.

## Changing domains, roles or industries

Edit `data.js`. If you add or rename a domain **id**, also update the allowed list in the `domains` check in `supabase/schema.sql`, and re-run it with `alter table`. Otherwise new submissions using that domain will be rejected.

## Run it on your computer

```powershell
cd domainfolio
python -m http.server 8080
```
Then open http://localhost:8080.

## Spam protection

The site already has these:
- The submit form has a hidden honeypot field to catch bots.
- The database checks field lengths and only accepts `https://` links.
- Nothing appears on the wall until you approve it.

If spam ever becomes a problem, turn on **Supabase → Authentication → Attack Protection (CAPTCHA)**, or put the submit form behind a sign-in.
