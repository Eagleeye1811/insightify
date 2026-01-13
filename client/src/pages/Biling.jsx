import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import FAQWithSpiral from '../components/ui/faq-section';

const pricingPlans = [
  {
    name: 'Trial',
    price: 0,
    period: '',
    description: 'Perfect for getting started with Insightify',
    features: [
      '2 App Count',
      '1 User Count',
      '50 Translation Limit',
      'Basic Support',
      '1 Filter Preset'
    ],
    buttonText: 'Ends in 30 days',
    highlighted: false,
    disabled: true
  },
  {
    name: 'Pro',
    price: 99,
    period: '/month',
    description: 'Ideal for professional usage',
    badge: 'Popular',
    features: [
      '5 App Count',
      '3 User Count',
      'Unlimited Translation Limit',
      'Priority Support',
      '5 Filter Presets',
      'Competitor Analysis',
      'Summary Data Export'
    ],
    buttonText: 'Subscribe',
    highlighted: true
  },
  {
    name: 'Enterprise',
    price: 250,
    period: '/month',
    description: 'Custom solutions for enterprise needs',
    features: [
      '10 App Count',
      '5 User Count',
      'Unlimited Translation Limit',
      'Priority Support',
      'Unlimited Filter Presets',
      'Competitor Analysis',
      'Summary Data Export',
      'Templates',
      'Automatic Responses',
      'Custom Topics',
      'Dedicated Account Manager',
      'Custom Integrations'
    ],
    buttonText: 'Subscribe',
    highlighted: false
  }
];

const comparisonFeatures = [
  { name: 'Number of Applications', trial: '2', pro: '5', enterprise: '10+' },
  { name: 'Number of Users', trial: '1', pro: '3', enterprise: '5' },
  { name: 'Version Comparison', trial: false, pro: true, enterprise: true },
  { name: 'Competitor Analysis', trial: false, pro: true, enterprise: true },
  { name: 'Summary Data Export', trial: false, pro: true, enterprise: true },
  { name: 'Translation Limit', trial: '50 commands', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'AI Reply Credits', trial: '10', pro: '100', enterprise: '100' },
  { name: 'Templates', trial: false, pro: false, enterprise: true },
  { name: 'Automatic Responses', trial: false, pro: false, enterprise: true },
  { name: 'Custom Topics', trial: false, pro: false, enterprise: true },
  { name: 'AI Model Quality', trial: 'Low', pro: 'High', enterprise: 'High' },
  { name: 'Current Feature', trial: false, pro: true, enterprise: true },
  { name: 'Number of Filter Presets', trial: '1', pro: '5', enterprise: '5' },
  { name: 'Support', trial: 'Standard', pro: 'Priority', enterprise: 'Priority' },
  { name: 'Dedicated Account Manager', trial: false, pro: false, enterprise: true },
  { name: 'Custom Integrations', trial: false, pro: false, enterprise: true }
];

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
      {/* Header */}
      <motion.div
        className="max-w-7xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Get Unlimited Access
        </h1>
        <p className="text-white/60 text-lg">
          Choose the perfect plan for your needs and unlock all features of Insightify
        </p>
      </motion.div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 mb-20">
        {pricingPlans.map((plan, index) => (
          <motion.div
            key={plan.name}
            className={`relative rounded-2xl p-8 flex flex-col ${
              plan.highlighted
                ? 'bg-white/10 border-2 border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)]'
                : 'bg-white/5 border border-white/10'
            }`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={!plan.disabled ? { y: -10, transition: { duration: 0.3 } } : {}}
          >
            {/* Badge */}
            {plan.badge && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-sm font-semibold">
                {plan.badge}
              </div>
            )}

            {/* Plan Name */}
            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <p className="text-white/60 text-sm mb-6">{plan.description}</p>

            {/* Price */}
            <div className="mb-6">
              <span className="text-5xl font-bold">${plan.price}</span>
              <span className="text-white/60">{plan.period}</span>
            </div>

            {/* Top Features */}
            <div className="space-y-3 mb-8">
              {plan.features.slice(0, 3).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-white/80">{feature}</span>
                </div>
              ))}
            </div>

            {/* Show all features */}
            {plan.features.length > 3 && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-white/60 hover:text-white transition-colors mb-3">
                  Show all features →
                </summary>
                <div className="space-y-3 mt-3">
                  {plan.features.slice(3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-white/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}

            {/* Button */}
            <button
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 mt-auto ${
                plan.highlighted
                  ? 'bg-white text-black hover:bg-white/90'
                  : plan.disabled
                  ? 'bg-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              disabled={plan.disabled}
            >
              {plan.buttonText}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Comparison Table */}
      (
        <motion.div
          className="max-w-7xl mx-auto overflow-x-auto"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-6 text-white/60 font-medium">Feature</th>
                <th className="text-center py-4 px-6 font-semibold">Trial</th>
                <th className="text-center py-4 px-6 font-semibold bg-white/5">Pro</th>
                <th className="text-center py-4 px-6 font-semibold">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature, index) => (
                <motion.tr
                  key={feature.name}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="py-4 px-6 text-white/80">{feature.name}</td>
                  <td className="py-4 px-6 text-center">
                    {typeof feature.trial === 'boolean' ? (
                      feature.trial ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )
                    ) : (
                      <span className="text-white/60">{feature.trial}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center bg-white/5">
                    {typeof feature.pro === 'boolean' ? (
                      feature.pro ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )
                    ) : (
                      <span className="text-white/80 font-medium">{feature.pro}</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {typeof feature.enterprise === 'boolean' ? (
                      feature.enterprise ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      )
                    ) : (
                      <span className="text-white/80 font-medium">{feature.enterprise}</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )

      {/* FAQ Section */}
      <div className="mt-20">
        <FAQWithSpiral />
      </div>
    </div>
  );
}
