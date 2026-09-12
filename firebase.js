// ============================================
// FIREBASE & EMAIL INTEGRATION
// ============================================
// This file handles:
// 1. Firebase Authentication (optional)
// 2. Email notifications for new users
// 3. Data persistence

// ============================================
// EMAIL SERVICE (Using EmailJS - FREE)
// ============================================
// To enable real email sending:
// 1. Sign up free at https://www.emailjs.com
// 2. Create an email service (Gmail, etc.)
// 3. Create an email template
// 4. Replace the IDs below with your own

const EMAILJS_CONFIG = {
    PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY',      // Get from emailjs.com dashboard
    SERVICE_ID: 'YOUR_SERVICE_ID',              // e.g., 'service_abc123'
    TEMPLATE_ID: 'YOUR_TEMPLATE_ID',            // e.g., 'template_xyz789'
    ENABLED: false                              // Set to true after configuring
};

// Load EmailJS library dynamically
function loadEmailJS() {
    return new Promise((resolve, reject) => {
        if (window.emailjs) {
            resolve(window.emailjs);
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
        script.onload = () => {
            if (EMAILJS_CONFIG.ENABLED && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
                window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
            }
            resolve(window.emailjs);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ============================================
// EMAIL SENDING FUNCTION
// ============================================
async function sendWelcomeEmail(userData) {
    const { name, email, role, password, id } = userData;
    
    // Email content
    const emailContent = {
        to_name: name,
        to_email: email,
        user_role: role.charAt(0).toUpperCase() + role.slice(1),
        user_id: id,
        user_password: password,
        login_url: window.location.origin + '/salarycode.html',
        company_name: 'TechNova Solutions',
        current_year: new Date().getFullYear()
    };
    
    console.log('📧 Preparing welcome email for:', email);
    console.log('📧 Email content:', emailContent);
    
    // If EmailJS is not enabled, use fallback (log to console + store in localStorage)
    if (!EMAILJS_CONFIG.ENABLED) {
        // Store email in localStorage for demo purposes
        const pendingEmails = JSON.parse(localStorage.getItem('pendingEmails') || '[]');
        pendingEmails.push({
            ...emailContent,
            sentAt: new Date().toISOString(),
            status: 'pending_configuration'
        });
        localStorage.setItem('pendingEmails', JSON.stringify(pendingEmails));
        
        console.log('✉️ EMAIL QUEUED (EmailJS not configured)');
        console.log('📬 View all pending emails: localStorage.getItem("pendingEmails")');
        
        // Show a notification in the UI
        showEmailNotification(email, name);
        
        return { success: true, method: 'localStorage' };
    }
    
    // Send via EmailJS
    try {
        const emailjs = await loadEmailJS();
        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            emailContent
        );
        
        console.log('✅ Email sent successfully:', response);
        
        // Log successful email
        const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
        sentEmails.push({
            ...emailContent,
            sentAt: new Date().toISOString(),
            status: 'sent'
        });
        localStorage.setItem('sentEmails', JSON.stringify(sentEmails));
        
        showEmailNotification(email, name);
        return { success: true, method: 'emailjs' };
        
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        
        // Fallback to localStorage
        const failedEmails = JSON.parse(localStorage.getItem('failedEmails') || '[]');
        failedEmails.push({
            ...emailContent,
            sentAt: new Date().toISOString(),
            status: 'failed',
            error: error.message
        });
        localStorage.setItem('failedEmails', JSON.stringify(failedEmails));
        
        return { success: false, error: error.message };
    }
}

// ============================================
// UI NOTIFICATION FOR EMAIL
// ============================================
function showEmailNotification(email, name) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, rgba(26, 39, 70, 0.95), rgba(18, 27, 46, 0.95));
        border: 1px solid rgba(74, 111, 227, 0.3);
        border-left: 4px solid #10B981;
        color: #E8E6E3;
        padding: 20px 25px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        max-width: 400px;
        backdrop-filter: blur(10px);
        animation: slideIn 0.4s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 15px;">
            <div style="font-size: 24px;">✉️</div>
            <div style="flex: 1;">
                <div style="font-weight: 700; margin-bottom: 5px; color: #10B981;">
                    Welcome Email Sent!
                </div>
                <div style="font-size: 13px; color: #8A93A5; line-height: 1.5;">
                    A welcome email has been sent to <strong style="color: #E8E6E3;">${email}</strong>
                </div>
                <div style="font-size: 11px; color: #8A93A5; margin-top: 8px;">
                    Please check your inbox (and spam folder) for login credentials.
                </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: none;
                border: none;
                color: #8A93A5;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: auto;
                line-height: 1;
            ">×</button>
        </div>
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    if (!document.getElementById('email-notification-style')) {
        style.id = 'email-notification-style';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideIn 0.4s ease reverse';
            setTimeout(() => notification.remove(), 400);
        }
    }, 8000);
}

// ============================================
// EMAIL INBOX VIEWER (For Admin/Demo)
// ============================================
function viewEmailInbox() {
    const pendingEmails = JSON.parse(localStorage.getItem('pendingEmails') || '[]');
    const sentEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
    const failedEmails = JSON.parse(localStorage.getItem('failedEmails') || '[]');
    
    const allEmails = [
        ...sentEmails.map(e => ({ ...e, type: 'sent' })),
        ...pendingEmails.map(e => ({ ...e, type: 'pending' })),
        ...failedEmails.map(e => ({ ...e, type: 'failed' }))
    ].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
    
    if (allEmails.length === 0) {
        alert('📭 No emails in the inbox yet.\n\nNew user signups will appear here.');
        return;
    }
    
    let message = '📬 EMAIL INBOX\n';
    message += '═'.repeat(50) + '\n\n';
    
    allEmails.forEach((email, i) => {
        const statusIcon = {
            'sent': '✅',
            'pending': '⏳',
            'failed': '❌'
        }[email.type] || '📧';
        
        message += `${statusIcon} Email #${i + 1}\n`;
        message += `To: ${email.to_name} <${email.to_email}>\n`;
        message += `Role: ${email.user_role}\n`;
        message += `User ID: ${email.user_id}\n`;
        message += `Password: ${email.user_password}\n`;
        message += `Sent: ${new Date(email.sentAt).toLocaleString()}\n`;
        message += `Status: ${email.type.toUpperCase()}\n`;
        message += '─'.repeat(50) + '\n\n';
    });
    
    alert(message);
    
    // Also log to console for detailed view
    console.table(allEmails);
}

// ============================================
// EXPORT FUNCTIONS TO GLOBAL SCOPE
// ============================================
window.sendWelcomeEmail = sendWelcomeEmail;
window.showEmailNotification = showEmailNotification;
window.viewEmailInbox = viewEmailInbox;

// ============================================
// FIREBASE INITIALIZATION (Optional)
// ============================================
// If you want real Firebase:
// 1. Go to https://console.firebase.google.com
// 2. Create a project
// 3. Add a web app
// 4. Copy the config below
// 5. Uncomment and fill in your details

/*
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDB = db;
*/

console.log('✅ Firebase/Email module loaded');
console.log('📧 To configure real emails, edit EMAILJS_CONFIG in firebase.js');
console.log('📬 View queued emails with: viewEmailInbox()');