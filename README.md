# VANISH

VANISH is a privacy-first, one-time encrypted messaging application.

Users create a message in their browser.

The message is encrypted locally using AES-GCM before being sent to Supabase.

The recipient receives a one-time link.

When the link is opened:

1. The backend atomically consumes the encrypted message.
2. The encrypted ciphertext is returned.
3. The browser decrypts it locally.
4. The database record no longer exists.
5. The message cannot be opened again.

---

# Architecture

Frontend:

- React
- Vite
- Netlify
- Web Crypto API

Backend:

- Supabase
- PostgreSQL
- Supabase Edge Functions

Encryption:

- AES-GCM
- 256-bit key
- Random 96-bit IV
- Browser-side encryption

---

# Important security model

The plaintext message is never intentionally stored in Supabase.

The encryption key is stored in the URL fragment.

Example:

https://example.com/s/UUID#ENCRYPTION_KEY

The fragment is processed by the browser and is not sent as part of the normal HTTP request.

---

# Environment variables

Create:

.env

with:

VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co

VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

Never place the Supabase service-role key in the Vite frontend environment.

---

# Local installation

Install dependencies:

npm install

Start development server:

npm run dev

The application will normally be available at:

http://localhost:5173

---

# Build test

Run:

npm run build

The command must finish successfully before deployment.

---

# Supabase setup

Create a Supabase project.

Run:

supabase/migrations/001_burn_messages.sql

against the project's database.

Deploy the Edge Function:

supabase/functions/consume-message/index.ts

The Edge Function requires the Supabase service-role key as a server-side secret.

Never expose that key through Vite or the browser.

---

# Netlify deployment

Connect the Git repository to Netlify.

Build command:

npm run build

Publish directory:

dist

Add the following environment variables:

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

Redeploy after adding the variables.

The website can display without messaging configuration. If either variable is
missing, creating or opening a message shows a temporary-unavailability error
instead of preventing the entire application from starting. Messaging requires
both variables and the Supabase backend setup described above.

---

# Security properties

VANISH implements:

- Browser-side encryption
- AES-GCM
- 256-bit encryption key
- Random IV
- One-time message consumption
- Atomic database deletion
- Automatic expiration
- No plaintext message database column
- No service-role key in frontend
- No intentional plaintext logging
- HTTPS requirement in production
- Security headers
- Content Security Policy
- Referrer Policy
- No persistent authentication session
- No analytics by default
- SPA route handling

---

# Important limitation

VANISH cannot guarantee that a message leaves absolutely no trace on every device or infrastructure system.

For example:

- A recipient can take a screenshot.
- A recipient can photograph the screen.
- A compromised device can capture the message.
- Browser/device operating systems may maintain their own artifacts.
- Infrastructure backups may have different retention policies.

Therefore the application should not claim:

"No trace is technically possible anywhere."

The accurate security claim is:

"VANISH encrypts messages client-side and consumes the stored message after successful one-time retrieval."

---

# Debugging checklist

## 1. Frontend

Run:

npm install

npm run build

The build must complete without errors.

---

## 2. Environment variables

Check:

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

Do not include quotes unless necessary.

---

## 3. Supabase table

Confirm:

burn_messages

exists.

Confirm RLS is enabled.

---

## 4. Insert test

Create a message.

Confirm that Supabase contains:

ciphertext

iv

expires_at

and NOT:

message_text

plaintext

---

## 5. One-time read test

Create one message.

Open the generated URL.

The message should display.

Refresh the page.

The second request should fail.

---

## 6. Expiry test

Create a message with a short expiration period.

After expiration the message should be unavailable.

---

## 7. Wrong key test

Modify the URL fragment.

Decryption should fail.

---

## 8. Invalid UUID test

Open:

/s/not-a-real-id

The application should show an unavailable message instead of crashing.

---

## 9. Empty message test

Submit an empty message.

The application must reject it.

---

## 10. Oversized message test

Attempt to exceed 10,000 characters.

The application must reject the message.

---

## 11. Production build

Run:

npm run build

Then:

npm run preview

Verify the production build locally.

---

## 12. Security check

Confirm that:

- service-role key is not inside src/
- service-role key is not inside .env committed to Git
- plaintext is not sent to Supabase
- plaintext is not logged
- CSP is active
- HTTPS is active on Netlify
- Supabase Edge Function is deployed
- direct SELECT access is not available to anonymous users
- consume operation is atomic

---

# Development debugging

During development, VANISH may print limited diagnostic information to the browser console.

Production diagnostic logging is disabled.

Sensitive plaintext, encryption keys, and ciphertext must never be added to debugging logs.
