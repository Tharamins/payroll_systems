PAYROLL MANAGEMENT SYSTEM
=========================

QUICK START
-----------
1. Open index.html in a browser
2. Click "Launch Application"
3. Login with demo credentials or sign up

DEMO CREDENTIALS
----------------
Admin:    admin@company.com / admin123
Employee: john.doe@company.com / password123

EMAIL NOTIFICATIONS
-------------------
New user signups automatically trigger welcome emails.

To enable REAL email sending:
1. Sign up free at https://www.emailjs.com
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template with these variables:
   - {{to_name}}
   - {{to_email}}
   - {{user_role}}
   - {{user_id}}
   - {{user_password}}
   - {{login_url}}
   - {{company_name}}
   - {{current_year}}
4. Edit firebase.js and update EMAILJS_CONFIG with your keys
5. Set ENABLED: true

Without configuration, emails are queued in browser storage.
View queued emails: Click "📬 Email Inbox" in admin sidebar

DEPLOYMENT
----------
Option 1: Netlify Drop
- Go to https://app.netlify.com/drop
- Drag the entire folder
- Get instant live URL

Option 2: Replit
- Upload files to replit.com
- Click Run

Option 3: GitHub Pages
- Push to GitHub
- Enable Pages in Settings

FEATURES
--------
✓ User authentication (Admin & Employee)
✓ Employee management
✓ Time tracking (clock in/out)
✓ Payroll calculation
✓ Loan management
✓ Financial reports (PDF export)
✓ Efficiency tracking with charts
✓ Email notifications for new users
✓ Modern dark elegant theme
✓ Responsive design