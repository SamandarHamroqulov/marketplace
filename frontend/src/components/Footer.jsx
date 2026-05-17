import Icons from './Icons.jsx';

const SERVICES = [
  'Bonus program',
  'Gift cards',
  'Credit and payment',
  'Service contracts',
  'Non-cash account',
  'Payment',
];

const ASSISTANCE = [
  'Find an order',
  'Terms of delivery',
  'Exchange and return of goods',
  'Guarantee',
  'Frequently asked questions',
  'Terms of use of the site',
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">cyber</div>
          <p className="footer-desc">
            We are a residential interior design firm located in Portland. Our boutique-studio offers
            more than custom furniture and accessories.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Twitter">{Icons.twitter}</a>
            <a href="#" aria-label="Facebook">{Icons.facebook}</a>
            <a href="#" aria-label="TikTok">{Icons.tiktok}</a>
            <a href="#" aria-label="Instagram">{Icons.instagram}</a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            {SERVICES.map((item) => (
              <li key={item}><a href="#">{item}</a></li>
            ))}
          </ul>
        </div>
        <div className="footer-col">
          <h4>Assistance to the buyer</h4>
          <ul>
            {ASSISTANCE.map((item) => (
              <li key={item}><a href="#">{item}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
