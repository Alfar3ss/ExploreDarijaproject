import translations from '../../lib/translations'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Privacy — ExploreDarija',
}

export default function PrivacyPage() {
  const t = (key: string) => {
    const parts = key.split('.')
    let cur: any = (translations as any).en
    for (const p of parts) {
      cur = cur?.[p]
      if (cur === undefined) break
    }
    return typeof cur === 'string' ? cur : ''
  }

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-8 py-12">
      <h1 className="text-2xl font-bold mb-4">ExploreDarija – Privacy Policy</h1>
      <p className="text-gray-700 mb-4">Last updated: December 7, 2025</p>
      <section className="prose prose-sm text-gray-700">
        <p>ExploreDarija (“we”, “our”, “us”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services, including Lhajja AI.</p>
        <h2>1. Information We Collect</h2>
        <h3>1.1 Information You Provide</h3>
        <ul>
          <li>Name and email address (when creating an account, contacting us, or subscribing)</li>
          <li>Messages you send to Lhajja AI</li>
          <li>Feedback, comments, or reviews</li>
          <li>Optional personal preferences (e.g., language level)</li>
        </ul>
        <h3>1.2 Automatically Collected Information</h3>
        <ul>
          <li>IP address</li>
          <li>Browser type</li>
          <li>Device type</li>
          <li>Usage data (pages visited, time spent, interactions)</li>
        </ul>
        <p>This helps us improve the website and maintain security.</p>
        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>Provide the ExploreDarija learning experience</li>
          <li>Enable Lhajja AI responses</li>
          <li>Improve our website and features</li>
          <li>Send important service emails (if you sign up)</li>
          <li>Protect against spam, fraud, and misuse</li>
          <li>Manage daily message limits for AI usage</li>
        </ul>
        <p>We never sell your personal data to anyone.</p>
        <h2>3. AI Message Data</h2>
        <p>Messages sent to Lhajja AI may be processed by our AI service provider (OpenAI or compatible models). This information is used only to generate a reply and improve service quality.</p>
        <p>We do not use your messages for advertising or profiling.</p>
        <h2>4. Cookies</h2>
        <p>We use cookies to:</p>
        <ul>
          <li>Maintain login sessions</li>
          <li>Track daily message limits for unregistered users</li>
          <li>Improve performance and analytics</li>
        </ul>
        <p>You can disable cookies in your browser, but some features may not work.</p>
        <h2>5. Data Security</h2>
        <p>We use reasonable technical and organizational measures to protect your information from:</p>
        <ul>
          <li>Unauthorized access</li>
          <li>Loss or misuse</li>
          <li>Disclosure</li>
        </ul>
        <p>No method of transmission online is 100% secure, but we take privacy seriously.</p>
        <h2>6. Your Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>Access your data</li>
          <li>Request deletion</li>
          <li>Update your information</li>
          <li>Withdraw consent</li>
          <li>Request a copy of your data</li>
        </ul>
        <p>You can contact us at: <a href="mailto:ichchoun@gmail.com">ichchoun@gmail.com</a></p>
        <h2>7. Third-Party Services</h2>
        <p>ExploreDarija may use third-party services such as:</p>
        <ul>
          <li>Analytics tools</li>
          <li>AI processing APIs</li>
          <li>Payment platforms (future)</li>
        </ul>
        <p>These third parties have their own privacy policies.</p>
        <h2>8. Children’s Privacy</h2>
        <p>ExploreDarija is not intended for children under 13 years old. We do not knowingly collect information from children.</p>
        <h2>9. Updates to This Privacy Policy</h2>
        <p>We may update this Privacy Policy. Changes will be posted on this page with the updated date.</p>
        <h2>10. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact:</p>
        <ul>
          <li>📩 <a href="mailto:ichchoun@gmail.com">ichchoun@gmail.com</a></li>
        </ul>
      </section>
    </main>
  )
}
