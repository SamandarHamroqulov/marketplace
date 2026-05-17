import Icons from './Icons.jsx';

export default function ProductCard({ product, onSelect, onWishToggle, isWished }) {
  return (
    <div className="product-card" onClick={() => onSelect(product)}>
      <div className="card-img-wrap">
        <img
          className="card-img"
          src={product.image}
          alt={product.name}
          onError={(e) => { e.target.src = 'https://via.placeholder.com/140x140?text=Product'; }}
        />
        <button
          type="button"
          className={`card-wish${isWished ? ' active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onWishToggle(product.id); }}
        >
          {isWished ? Icons.heartFill : Icons.heart}
        </button>
      </div>
      <div className="card-body">
        <div className="card-name">{product.name}</div>
        <div className="card-model">({product.model})</div>
        <div className="card-price">${product.price.toLocaleString()}</div>
        <button type="button" className="card-btn" onClick={(e) => e.stopPropagation()}>Buy Now</button>
      </div>
    </div>
  );
}
