import './SkeletonCard.css';

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-top">
        <div className="skeleton-block skeleton-badge" />
        <div className="skeleton-block skeleton-timer" />
      </div>
      <div className="skeleton-block skeleton-title" />
      <div className="skeleton-block skeleton-author" />
      <div className="skeleton-stats">
        <div className="skeleton-block skeleton-stat" />
        <div className="skeleton-block skeleton-stat" />
        <div className="skeleton-block skeleton-stat" />
      </div>
    </div>
  );
}
