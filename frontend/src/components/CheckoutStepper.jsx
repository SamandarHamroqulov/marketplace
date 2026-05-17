import Icons from './Icons.jsx';

const STEPS = [
  { id: 1, label: 'Address', icon: Icons.pin },
  { id: 2, label: 'Shipping', icon: Icons.truck },
  { id: 3, label: 'Payment', icon: Icons.card },
];

export default function CheckoutStepper({ step }) {
  return (
    <div className="checkout-stepper">
      {STEPS.map((s, i) => (
        <div key={s.id} className={`stepper-item${step === s.id ? ' active' : ''}${step > s.id ? ' done' : ''}`}>
          <div className="stepper-icon">{s.icon}</div>
          <span className="stepper-label">{s.label}</span>
          {i < STEPS.length - 1 && <div className="stepper-line" />}
        </div>
      ))}
    </div>
  );
}
