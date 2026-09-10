import { Link } from 'react-router-dom'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-brand-cream py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-pink-100 p-8 md:p-12 shadow-sm">
        
        <div className="mb-8 border-b border-gray-100 pb-6">
          <h1 className="font-display text-3xl text-brand-charcoal mb-2">Terms and Conditions of Service</h1>
          <p className="text-sm text-brand-muted">Effective Date: 9 September 2026 | Last Updated: 10 September 2026</p>
        </div>

        <div className="space-y-8 text-sm text-brand-muted leading-relaxed">
          
          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">1. Acceptance of Terms</h2>
            <p>
              By creating an account or placing an order on tinitrove.co.ke, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree, you must not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">2. About TiniTrove</h2>
            <p>
              TiniTrove is a Kenyan e-commerce platform specialising in curated gifts, imported aesthetic products, and lifestyle items. We operate as a retailer, purchasing and importing products for resale. We are not a marketplace — all products listed are sold directly by TiniTrove.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">3. Account Registration</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-brand-charcoal">Eligibility:</strong> You must be at least 18 years old to create an account. Users between 13 and 17 require parental consent.</li>
              <li><strong className="text-brand-charcoal">Account responsibility:</strong> You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately at tinitrove@gmail.com if you suspect unauthorised access to your account.</li>
              <li><strong className="text-brand-charcoal">Accurate information:</strong> You agree to provide accurate, current, and complete information during registration. TiniTrove reserves the right to suspend or terminate accounts where information is found to be false or misleading.</li>
              <li><strong className="text-brand-charcoal">One account per person:</strong> Creating multiple accounts to circumvent restrictions, abuse promotions, or manipulate the Tinipoints system is prohibited and will result in permanent suspension.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">4. Products and Pricing</h2>
            <p className="mb-2">
              All product prices are displayed in Kenyan Shillings (KES) and are inclusive of applicable taxes. Prices are subject to change without notice. The price at the time of placing your order is the price you will be charged.
            </p>
            <p className="mb-2">
              TiniTrove makes every effort to display product images and descriptions accurately. However, slight variations in colour, size, or appearance may exist due to photography conditions, screen settings, or import variances. Such variations do not constitute grounds for a refund unless the product is materially different from what was described.
            </p>
            <p>
              TiniTrove reserves the right to cancel an order if a product is found to be out of stock after payment, if a pricing error is identified, or if the order is flagged as potentially fraudulent. In such cases, a full refund will be processed within 24 hours.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">5. Orders and Payment</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-brand-charcoal">Order confirmation:</strong> An order is confirmed only after successful M-Pesa payment is received and a confirmation notification is sent to your registered contact details.</li>
              <li><strong className="text-brand-charcoal">Payment method:</strong> TiniTrove currently accepts payment exclusively via M-Pesa STK Push (Safaricom). Payment is processed by Safaricom and TiniTrove does not store your payment credentials.</li>
              <li><strong className="text-brand-charcoal">Failed payments & Callbacks:</strong> If an M-Pesa prompt is sent and payment is not completed within the session window, no charge is made and the order remains unpaid. If your M-Pesa account is deducted but your order does not automatically confirm (due to network delays), please contact us immediately with the M-Pesa confirmation code so we can manually verify and process your order.</li>
              <li><strong className="text-brand-charcoal">Order modification:</strong> Once an order is confirmed and payment received, it cannot be modified. Contact tinitrove@gmail.com as soon as possible if you need to make changes and we will do our best to accommodate requests before dispatch.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">6. Delivery</h2>
            <p className="mb-2"><strong className="text-brand-charcoal">Serviceable areas:</strong> TiniTrove currently delivers to the following counties only: Nairobi, Kiambu, Murang'a, Nyeri, and Kirinyaga (Sagana area). We do not deliver outside these counties at this time.</p>
            <p className="mb-2"><strong className="text-brand-charcoal">Delivery fees:</strong></p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Nairobi, Kiambu, Nyeri: KES 200</li>
              <li>Kirinyaga (Sagana): KES 150</li>
              <li>Murang'a: Free</li>
            </ul>
            <p className="mb-2"><strong className="text-brand-charcoal">Delivery timelines:</strong> Estimated delivery times will be communicated at the time of order confirmation. These are estimates and not guaranteed. Delays caused by circumstances beyond our control including courier issues, weather events, or public holidays do not entitle you to a refund.</p>
            <p className="mb-2"><strong className="text-brand-charcoal">Delivery responsibility:</strong> TiniTrove is responsible for your order until it is handed to the courier. Once handed over, responsibility transfers to the courier. TiniTrove will assist in investigating missing or damaged deliveries but cannot guarantee courier performance.</p>
            <p><strong className="text-brand-charcoal">Failed delivery:</strong> If delivery is attempted and you are unavailable, we will contact you to arrange a re-delivery. Repeated failed delivery attempts may result in return of goods with no refund on delivery fees.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">7. Returns and Refunds</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-brand-charcoal">Wrong or damaged item:</strong> If you receive an item that is different from what you ordered, or an item that is damaged on arrival, you must contact us within 48 hours of delivery with photographic evidence. We will arrange a replacement or full refund at our discretion.</li>
              <li><strong className="text-brand-charcoal">Out of stock after payment:</strong> If a paid item becomes unavailable before dispatch, you will receive a full refund including delivery fees within 24 hours.</li>
              <li><strong className="text-brand-charcoal">Change of mind:</strong> TiniTrove does not accept returns or issue refunds for change of mind, incorrect size selection by the customer, or personal preference. We encourage you to review product descriptions carefully before purchasing.</li>
              <li><strong className="text-brand-charcoal">Refund processing:</strong> Approved refunds are initiated within 24 hours, but funds may take 3 to 5 business days to reflect in your M-Pesa account depending on Safaricom's reversal procedures.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">8. Tinipoints Loyalty Programme</h2>
            <p className="mb-2">
              Tinipoints are earned on completed and paid orders at a rate determined by TiniTrove at its sole discretion. Tinipoints have no monetary or cash value and cannot be transferred, sold, or redeemed for cash.
            </p>
            <p>
              TiniTrove reserves the right to modify, suspend, or discontinue the Tinipoints programme at any time without prior notice. Points earned remain valid unless the account is suspended for violations of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">9. Intellectual Property</h2>
            <p className="mb-2">
              All content on tinitrove.co.ke including product images, descriptions, logos, design elements, and software is the intellectual property of TiniTrove or its licensors. You may not reproduce, scrape, redistribute, or use any content for commercial purposes without written permission from TiniTrove.
            </p>
            <p>
              Product images are sourced from suppliers or created by TiniTrove and represent the goods sold. Unauthorised use of these images constitutes infringement and will be actioned accordingly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">10. Prohibited Conduct</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Use TiniTrove for any unlawful purpose</li>
              <li>Attempt to gain unauthorised access to any part of the platform or its infrastructure</li>
              <li>Submit false, misleading, or fraudulent orders</li>
              <li>Manipulate prices, promotions, or the Tinipoints system through technical means</li>
              <li>Use automated tools to scrape, crawl, or copy platform content</li>
              <li>Impersonate another user or TiniTrove staff</li>
              <li>Engage in any conduct that disrupts the experience of other users</li>
            </ul>
            <p>
              Violation of any of the above may result in immediate account suspension and, where applicable, reporting to relevant Kenyan authorities.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">11. Limitation of Liability</h2>
            <p className="mb-2">To the maximum extent permitted by Kenyan law, TiniTrove shall not be liable for:</p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Indirect, incidental, or consequential losses arising from use of the platform</li>
              <li>Loss of data or business interruption</li>
              <li>Delays in delivery caused by couriers or force majeure events</li>
              <li>Actions of third-party payment processors</li>
            </ul>
            <p>
              TiniTrove's total liability to you for any claim arising from use of the platform shall not exceed the value of the order in dispute.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">12. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms are governed by the laws of Kenya. Any dispute arising from or relating to these Terms or your use of TiniTrove shall first be attempted to be resolved informally by contacting tinitrove@gmail.com. If informal resolution fails within 30 days, disputes shall be subject to the exclusive jurisdiction of the courts of Nairobi, Kenya.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">13. Modifications to Terms</h2>
            <p>
              TiniTrove reserves the right to update these Terms at any time. Continued use of the platform after updated Terms are posted constitutes your acceptance. For material changes affecting your rights, we will notify registered users by email at least 14 days in advance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-brand-charcoal mb-2">14. Contact</h2>
            <div className="space-y-1">
              <p>For all inquiries relating to these Terms or your account:</p>
              <p><strong className="text-brand-charcoal">Email:</strong> tinitrove@gmail.com</p>
              <p><strong className="text-brand-charcoal">Phone/WhatsApp:</strong> 0111970400</p>
              <p><strong className="text-brand-charcoal">Instagram:</strong> @tini.troveke</p>
              <p><strong className="text-brand-charcoal">Website:</strong> tinitrove.co.ke</p>
            </div>
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