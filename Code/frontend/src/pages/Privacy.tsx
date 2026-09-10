import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-brand-cream py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-pink-100 p-8 md:p-12 shadow-sm">
        
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="font-display text-3xl text-brand-charcoal mb-2">Privacy Policy</h1>
          <p className="text-sm text-brand-muted">Effective Date: 9 September 2026 | Last Updated: 10 September 2026</p>
        </div>

        <div className="space-y-8 text-sm text-brand-muted leading-relaxed">
          
          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">1. Who We Are</h2>
            <p>
              TiniTrove  is an e-commerce platform operated in Kenya, accessible at tinitrove.co.ke. We sell curated gifts and imported aesthetic products delivered across select Kenyan counties. For privacy-related inquiries, contact us at <a href="mailto:tinitrove@gmail.com" className="text-brand-pink hover:underline">tinitrove@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">2. Information We Collect</h2>
            <p className="mb-2 font-medium text-brand-charcoal">Information you provide directly:</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Full name (first and last name)</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Delivery address (county )</li>
              <li>Order history and transaction details</li>
            </ul>
            
            <p className="mb-2 font-medium text-brand-charcoal">Information collected automatically:</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Authentication session tokens (to keep you logged in)</li>
              <li>Cart contents stored in your browser's local storage</li>
              <li>The device and browser type used to access our platform</li>
            </ul>

            <p className="mb-2 font-medium text-brand-charcoal">Information we do not collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>M-Pesa PINs or any payment credentials</li>
              <li>Government identification numbers</li>
              <li>Sensitive personal data as defined under Kenya's Data Protection Act 2019</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">3. How We Use Your Information</h2>
            <p className="mb-2">We use your personal information solely for the following purposes:</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Processing and fulfilling your orders</li>
              <li>Sending order confirmation and delivery updates via the contact details you provide</li>
              <li>Managing your TiniTrove account and Tinipoints loyalty balance</li>
              <li>Responding to your support requests and complaints</li>
              <li>Improving platform performance and fixing technical issues</li>
              <li>Complying with legal obligations under Kenyan law</li>
            </ul>
            <p>
              We use secure third-party email services (such as Gmail SMTP) to route order confirmations and password reset links. These providers act as data processors and do not use your email for their own purposes. We do not use your information for advertising profiling, sell your data to third parties, or share your information with any entity outside of what is necessary to complete your order.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">4. Payment Data</h2>
            <p>
              TiniTrove processes payments exclusively through Safaricom's M-Pesa Daraja API. We do not store, process, or have access to your M-Pesa PIN, card numbers, or any payment credentials. Payment processing is handled entirely by Safaricom on their secure infrastructure. TiniTrove only receives a transaction confirmation reference number after a successful payment.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">5. Data Sharing</h2>
            <p>
              We do not sell your personal data. We may share your delivery address and name with courier partners solely for the purpose of delivering your order. These partners are contractually obligated to use your information only for delivery purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">6. Cookies and Local Storage</h2>
            <p className="mb-2">TiniTrove uses strictly necessary browser storage technologies:</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li><strong className="text-brand-charcoal">Session tokens:</strong> A secure authentication token is stored in your browser's local storage when you sign in. This keeps you logged in across visits and expires automatically. It is never shared with third parties.</li>
              <li><strong className="text-brand-charcoal">Cart data:</strong> Items in your cart are saved locally in your browser so your cart persists between visits. This data remains on your device.</li>
            </ul>
            <p>
              <strong className="text-brand-charcoal">What we do not use:</strong> TiniTrove does not use Google Analytics, Facebook Pixel, advertising cookies, or any third-party behavioural tracking technology. We do not build advertising profiles from your browsing behaviour. No cookie consent banner is required because we use no tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">7. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. Order records are retained for a minimum of seven years for financial compliance purposes under Kenyan tax law. You may request deletion of your personal data by contacting tinitrove@gmail.com. Note that order records required for legal compliance cannot be deleted before the statutory retention period expires.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">8. Your Rights Under the Data Protection Act 2019</h2>
            <p className="mb-2">As a data subject under Kenya's Data Protection Act 2019, you have the right to:</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li><strong className="text-brand-charcoal">Access:</strong> request a copy of the personal data we hold about you</li>
              <li><strong className="text-brand-charcoal">Correction:</strong> request correction of inaccurate or incomplete data</li>
              <li><strong className="text-brand-charcoal">Deletion:</strong> request erasure of your data, subject to legal retention requirements</li>
              <li><strong className="text-brand-charcoal">Objection:</strong> object to processing of your data for purposes beyond order fulfillment</li>
              <li><strong className="text-brand-charcoal">Portability:</strong> receive your data in a structured, machine-readable format</li>
            </ul>
            <p>To exercise any of these rights, contact tinitrove@gmail.com. We will respond within 21 days as required by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">9. Data Security</h2>
            <p>
              We implement industry-standard security measures including encrypted data transmission (HTTPS/TLS), row-level security policies on our database ensuring users can only access their own data, and secure authentication managed by Supabase Auth. Despite these measures, no internet transmission is completely secure. We encourage you to use a strong password and not share your account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">10. Children's Privacy</h2>
            <p>
              TiniTrove is intended for users aged 18 and above. Users aged 13 to 17 may use the platform only with verifiable parental or guardian consent. We do not knowingly collect personal data from children under 13. If you believe a child under 13 has created an account, contact us immediately at tinitrove@gmail.com and we will delete the account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">11. Changes to This Policy</h2>
            <p>
              We reserve the right to update this Privacy Policy at any time. Material changes will be communicated via the email address on your account at least 14 days before taking effect. Continued use of TiniTrove after that date constitutes acceptance of the updated policy.
            </p>
          </section>
          
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 text-center">
          <Link to="/" className="text-sm text-brand-pink hover:underline font-medium">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}