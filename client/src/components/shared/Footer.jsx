import { Github, Youtube, Presentation, Figma } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

const SOCIAL_LINKS = [
  {
    icon: Github,
    label: 'GitHub',
    href: 'https://github.com/Achyut21/roastmyidea',
    external: true,
  },
  {
    icon: Youtube,
    label: 'YouTube',
    href: 'https://youtu.be/PLACEHOLDER',
    external: true,
  },
  {
    icon: Presentation,
    label: 'Presentation',
    href: 'https://www.canva.com/design/DAHEb2l0pZ4/m2r9RFUiHWc7poiUrXUuFA/edit?utm_content=DAHEb2l0pZ4&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton',
    external: true,
  },
  {
    icon: Figma,
    label: 'Figma',
    href: 'https://www.figma.com/proto/yYo7Sp8kBIOD0Now5FP4eH/RoastMyIdea?page-id=0%3A1&node-id=1-317&p=f&viewport=945%2C400%2C0.4&t=XVGZs7aMbx4jeSMl-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=1%3A317',
    external: true,
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <Link to="/" className="footer-logo">
            <img src="/logo.webp" alt="RoastMyIdea logo" className="footer-logo-img" />
            RoastMyIdea
          </Link>
          <p className="footer-tagline">Pitch your idea. The internet decides.</p>
        </div>

        <nav className="footer-icons" aria-label="External links">
          {SOCIAL_LINKS.map(({ icon: Icon, label, href, external }) => (
            <a
              key={label}
              href={href}
              className="footer-icon-link"
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <Icon size={18} aria-hidden="true" />
              <span className="visually-hidden">{label}</span>
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
