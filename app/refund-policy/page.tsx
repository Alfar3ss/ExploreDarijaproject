export default function RefundPolicy() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">ExploreDarija – Refund Policy</h1>
            
            <p className="text-sm text-gray-600 mb-6">Last updated: March 7, 2025</p>
            
            <p className="mb-6">
                ExploreDarija is owned and operated by <strong>MEN VINTAGE LTD</strong>.
            </p>
            
            <div className="prose max-w-none">
                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-3">1. Refund Eligibility</h2>
                    <p className="mb-4">
                        If you purchase any paid services, subscriptions, or digital products through ExploreDarija, 
                        you may request a refund within <strong>14 days of the purchase date</strong>.
                    </p>
                    <p className="mb-2">To be eligible for a refund:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>The request must be made within 14 days of the purchase.</li>
                        <li>The purchase must have been made directly through the ExploreDarija platform.</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-3">2. How to Request a Refund</h2>
                    <p className="mb-4">
                        To request a refund, please contact us by email and include your purchase information.
                    </p>
                    <p className="mb-4">
                        📩 <strong>Email:</strong>{' '}
                        <a href="mailto:ichchoun@gmail.com" className="text-blue-600 hover:underline">
                            ichchoun@gmail.com
                        </a>
                    </p>
                    <p className="mb-4">
                        Our team will review your request and respond within a reasonable timeframe.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-3">3. Non-Refundable Situations</h2>
                    <p className="mb-2">Refunds may be refused in the following situations:</p>
                    <ul className="list-disc pl-6 mb-4 space-y-2">
                        <li>Abuse or misuse of the platform</li>
                        <li>Violation of our Terms & Conditions</li>
                        <li>Fraudulent or suspicious activity</li>
                        <li>Excessive use of the service before requesting a refund</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-3">4. Processing Refunds</h2>
                    <p className="mb-4">
                        If your refund request is approved, the refund will be processed using the{' '}
                        <strong>same payment method used for the original purchase</strong>, unless otherwise 
                        required by applicable law.
                    </p>
                    <p className="mb-4">
                        The time required for the refund to appear may depend on your payment provider or bank.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-2xl font-semibold mb-3">5. Contact</h2>
                    <p className="mb-4">
                        If you have any questions regarding this Refund Policy, you may contact us at:
                    </p>
                    <p className="mb-4">
                        📩{' '}
                        <a href="mailto:ichchoun@gmail.com" className="text-blue-600 hover:underline">
                            ichchoun@gmail.com
                        </a>
                    </p>
                    <p className="mb-4">
                        Operated by <strong>MEN VINTAGE LTD</strong>
                    </p>
                </section>
            </div>
        </div>
    );
}