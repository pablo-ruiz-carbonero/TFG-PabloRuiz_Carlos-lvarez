import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { marketService } from '../services/marketService';
import { chatService } from '../services/chatService';
import { Product, ProductCategory } from '../types';
import { 
  ShoppingBag, Search, Filter, Plus, X, 
  MapPin, MessageSquare, AlertCircle, User,
  Heart, Star, ArrowUpDown, ShieldCheck, Phone,
  Leaf, Wrench, Sprout, Tag, Layers, CheckCircle,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Predefined Spanish Provinces
const PROVINCIAS_ESPANA = [
  'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Baleares', 'Barcelona', 'Burgos',
  'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba', 'La Coruña', 'Cuenca', 'Gerona', 'Granada',
  'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca', 'Jaén', 'León', 'Lérida', 'Lugo', 'Madrid', 'Málaga',
  'Murcia', 'Navarra', 'Orense', 'Palencia', 'Las Palmas', 'Pontevedra', 'La Rioja', 'Salamanca', 'Segovia', 'Sevilla',
  'Soria', 'Tarragona', 'Santa Cruz de Tenerife', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Vizcaya', 'Zamora', 'Zaragoza',
  'Ceuta', 'Melilla'
];

// Preset high quality images for the agricultural publish form
const IMAGE_PRESETS = [
  { name: 'Tomates', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=600' },
  { name: 'Trigo', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600' },
  { name: 'Tractor', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600' },
  { name: 'Semillas', url: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&q=80&w=600' },
  { name: 'Abono', url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600' },
  { name: 'Patatas', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=600' },
];

// Helper to resize and compress device images for lightweight localStorage storage
const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% compression
          resolve(dataUrl);
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [revealedPhoneProductId, setRevealedPhoneProductId] = useState<string | null>(null);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showOnlyFavs, setShowOnlyFavs] = useState(false);

  // Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'priceAsc' | 'priceDesc'>('newest');

  // Modals and Alerts
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);

  // Add product form states
  const [prodTitle, setProdTitle] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('crops');
  const [prodPrice, setProdPrice] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodUnit, setProdUnit] = useState('kg');
  const [prodLocation, setProdLocation] = useState('');
  const [selectedPresetUrl, setSelectedPresetUrl] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Load products and favorites on mount
  useEffect(() => {
    loadProducts();
    const storedFavs = localStorage.getItem('agro_favorites');
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {
        console.error('Error parsing favorites', e);
      }
    }
  }, []);

  // Reset active image index when product details open/change
  useEffect(() => {
    setActiveImgIndex(0);
  }, [selectedProduct]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await marketService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerAlert = (text: string, type: 'success' | 'danger' = 'success') => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  // Toggle Favorite
  const toggleFavorite = (productId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    let updated;
    if (favorites.includes(productId)) {
      updated = favorites.filter(id => id !== productId);
      triggerAlert('Eliminado de tus favoritos ❤️', 'success');
    } else {
      updated = [...favorites, productId];
      triggerAlert('Añadido a tus favoritos ❤️', 'success');
    }
    setFavorites(updated);
    localStorage.setItem('agro_favorites', JSON.stringify(updated));
  };

  // Handle product publishing
  const handlePublishProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !prodTitle || !prodDescription || !prodPrice || !prodStock || !prodLocation) return;

    try {
      const finalImages = uploadedImages.length > 0 ? uploadedImages : [
        selectedPresetUrl || customImageUrl || 
        IMAGE_PRESETS.find(p => p.name.toLowerCase() === prodCategory)?.url || 
        IMAGE_PRESETS[0].url
      ];

      await marketService.addProduct({
        title: prodTitle,
        description: prodDescription,
        category: prodCategory,
        price: parseFloat(prodPrice),
        stock: parseInt(prodStock),
        unit: prodUnit,
        location: prodLocation,
        image: finalImages[0],
        images: finalImages,
        sellerId: user.id,
        sellerName: user.name,
        sellerRole: user.role,
      });

      // Clear Form
      setProdTitle('');
      setProdDescription('');
      setProdCategory('crops');
      setProdPrice('');
      setProdStock('');
      setProdUnit('kg');
      setProdLocation('');
      setSelectedPresetUrl('');
      setCustomImageUrl('');
      setUploadedImages([]);
      
      setIsPublishModalOpen(false);
      triggerAlert('Anuncio publicado con éxito 🚀', 'success');
      loadProducts();
    } catch (err) {
      console.error(err);
      triggerAlert('Error al publicar el anuncio.', 'danger');
    }
  };

  // Handle product deletion ("Retirar Anuncio")
  const handleDeleteProduct = async (productId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!window.confirm('¿Estás seguro de que quieres retirar esta publicación?')) return;
    try {
      await marketService.deleteProduct(productId);
      setSelectedProduct(null);
      triggerAlert('Anuncio retirado correctamente.', 'success');
      loadProducts();
    } catch (err) {
      console.error(err);
      triggerAlert('Error al retirar el anuncio.', 'danger');
    }
  };

  // Start chat with seller
  const handleContactSeller = async (sellerId: string, sellerName: string, productTitle: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const initMessage = `Hola, estoy interesado en tu producto "${productTitle}" de AgroLink. ¿Sigue disponible?`;
      await chatService.sendMessage(user.id, sellerId, initMessage);
      
      setSelectedProduct(null);
      navigate('/messages', { state: { selectParticipantId: sellerId } });
    } catch (err) {
      console.error('Error starting chat', err);
      triggerAlert('No se pudo abrir la mensajería.', 'danger');
    }
  };

  const handleShowSellerPhone = (sellerName: string, sellerRole: string) => {
    // Wallapop style dynamic phone reveal
    alert(`Contacto de ${sellerName.split(' (')[0]}:\n📞 Teléfono: +34 688 ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)}\nHorario recomendado: 08:00 a 18:00`);
  };

  // Filter & Sort Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || p.category === category;
    const matchesMinPrice = !minPrice || p.price >= parseFloat(minPrice);
    const matchesMaxPrice = !maxPrice || p.price <= parseFloat(maxPrice);
    const matchesLocation = !location || p.location.toLowerCase().includes(location.toLowerCase());
    const matchesFav = !showOnlyFavs || favorites.includes(p.id);

    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice && matchesLocation && matchesFav;
  });

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'priceAsc') {
      return a.price - b.price;
    }
    if (sortBy === 'priceDesc') {
      return b.price - a.price;
    }
    // newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getCategoryLabel = (cat: ProductCategory) => {
    const labels: Record<ProductCategory, string> = {
      seeds: 'Semillas / Plantas',
      machinery: 'Maquinaria',
      crops: 'Cosechas / Alimentos',
      inputs: 'Fertilizantes / Insumos',
    };
    return labels[cat] || cat;
  };

  const getCategoryBadgeClass = (cat: ProductCategory) => {
    const classes: Record<ProductCategory, string> = {
      seeds: 'badge-success',
      machinery: 'badge-warning',
      crops: 'badge-info',
      inputs: 'badge-danger',
    };
    return classes[cat] || 'badge-secondary';
  };

  // Generate pseudo ratings for sellers
  const getSellerRating = (sellerId: string) => {
    const sum = sellerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const score = (4.0 + (sum % 11) * 0.1).toFixed(1);
    const reviewsCount = 5 + (sum % 25);
    return { score, reviewsCount };
  };

  // Related products (same category, different product id)
  const relatedProducts = selectedProduct 
    ? products
        .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
        .slice(0, 3)
    : [];

  return (
    <div className="fade-in">
      {/* Toast Alert */}
      {alertMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: alertMsg.type === 'success' ? 'var(--primary-dark)' : 'var(--danger)',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <CheckCircle size={18} />
          <span style={{ fontWeight: 600 }}>{alertMsg.text}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="crops-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h2 className="crops-title-section" style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            <ShoppingBag size={28} style={{ color: 'var(--primary)' }} />
            Marketplace Agrícola
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Insumos, cosechas y maquinaria agrícola al estilo Wallapop. Trato directo entre profesionales.
          </p>
        </div>
        {user && (
          <button className="btn btn-primary" onClick={() => setIsPublishModalOpen(true)}>
            <Plus size={18} />
            Publicar Producto
          </button>
        )}
      </div>

      {/* Wallapop Category Pills */}
      <div className="category-pills-container">
        <button 
          className={`category-pill ${category === 'all' && !showOnlyFavs ? 'active' : ''}`}
          onClick={() => { setCategory('all'); setShowOnlyFavs(false); }}
        >
          <ShoppingBag size={16} />
          Todos
        </button>
        <button 
          className={`category-pill ${category === 'crops' && !showOnlyFavs ? 'active' : ''}`}
          onClick={() => { setCategory('crops'); setShowOnlyFavs(false); }}
        >
          <Sprout size={16} />
          Cosechas
        </button>
        <button 
          className={`category-pill ${category === 'seeds' && !showOnlyFavs ? 'active' : ''}`}
          onClick={() => { setCategory('seeds'); setShowOnlyFavs(false); }}
        >
          <Leaf size={16} />
          Semillas
        </button>
        <button 
          className={`category-pill ${category === 'machinery' && !showOnlyFavs ? 'active' : ''}`}
          onClick={() => { setCategory('machinery'); setShowOnlyFavs(false); }}
        >
          <Wrench size={16} />
          Maquinaria
        </button>
        <button 
          className={`category-pill ${category === 'inputs' && !showOnlyFavs ? 'active' : ''}`}
          onClick={() => { setCategory('inputs'); setShowOnlyFavs(false); }}
        >
          <Layers size={16} />
          Insumos
        </button>
        <button 
          className={`category-pill ${showOnlyFavs ? 'active' : ''}`}
          style={{ border: showOnlyFavs ? '1px solid #e63946' : '1px solid var(--border)' }}
          onClick={() => setShowOnlyFavs(true)}
        >
          <Heart size={16} fill={showOnlyFavs ? 'white' : 'transparent'} style={{ color: showOnlyFavs ? 'white' : '#e63946' }} />
          Favoritos ({favorites.length})
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="market-filter-bar" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div className="market-filter-group" style={{ minWidth: 'auto' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Search size={14} /> Buscar
          </label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="¿Qué estás buscando? Trigo, Tractor, Abono..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="market-filter-group" style={{ minWidth: 'auto' }}>
          <label className="form-label">Precio Rango (€)</label>
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
            <input 
              type="number" 
              className="form-control" 
              placeholder="Mín"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              style={{ padding: '0.4rem' }}
            />
            <span style={{ color: 'var(--text-muted)' }}>-</span>
            <input 
              type="number" 
              className="form-control" 
              placeholder="Máx"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              style={{ padding: '0.4rem' }}
            />
          </div>
        </div>

        <div className="market-filter-group" style={{ minWidth: 'auto' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} /> Ubicación
          </label>
          <select 
            className="form-control" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Todas las Provincias</option>
            {PROVINCIAS_ESPANA.map(prov => (
              <option key={prov} value={prov}>{prov}</option>
            ))}
          </select>
        </div>

        <div className="market-filter-group" style={{ minWidth: 'auto' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpDown size={14} /> Ordenar
          </label>
          <select 
            className="form-control"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="newest">Más recientes</option>
            <option value="priceAsc">Precio: de menor a mayor</option>
            <option value="priceDesc">Precio: de mayor a menor</option>
          </select>
        </div>
      </div>

      {/* Catalog Render */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Cargando catálogo agrícola...
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem', color: 'var(--border)' }} />
          <h3>No se encontraron anuncios</h3>
          <p>{showOnlyFavs ? 'No tienes ningún anuncio guardado en favoritos todavía.' : 'Prueba a cambiar tus palabras clave o filtros de búsqueda.'}</p>
        </div>
      ) : (
        <div className="product-grid">
          {sortedProducts.map(prod => {
            const isFavorite = favorites.includes(prod.id);
            const { score } = getSellerRating(prod.sellerId);
            return (
              <div 
                key={prod.id} 
                className="card product-card" 
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                onClick={() => setSelectedProduct(prod)}
              >
                {/* Favorite Heart Button Overlay */}
                <button 
                  className={`favorite-heart-btn ${isFavorite ? 'is-fav' : ''}`}
                  onClick={(e) => toggleFavorite(prod.id, e)}
                  title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                >
                  <Heart size={18} fill={isFavorite ? '#e63946' : 'transparent'} />
                </button>

                <div className="product-image-container">
                  <span className={`badge ${getCategoryBadgeClass(prod.category)} product-badge-category`}>
                    {getCategoryLabel(prod.category)}
                  </span>
                  <img src={prod.image} alt={prod.title} className="product-image" />
                </div>

                <div className="product-card-body">
                  <div>
                    {/* Price and location info */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <div className="product-card-price" style={{ margin: 0 }}>
                        {prod.price.toLocaleString('es-ES')} € 
                        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}> / {prod.unit}</span>
                      </div>
                    </div>

                    <h3 className="product-card-title" style={{ fontSize: '1.05rem', margin: '0.25rem 0' }}>{prod.title}</h3>
                    
                    <p style={{ 
                      fontSize: '0.82rem', 
                      color: 'var(--text-muted)', 
                      display: '-webkit-box', 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: 'vertical', 
                      overflow: 'hidden',
                      margin: '0.5rem 0'
                    }}>
                      {prod.description}
                    </p>
                  </div>

                  <div className="product-card-meta">
                    <div className="product-card-meta-row">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500 }}>
                        <MapPin size={12} style={{ color: 'var(--primary)' }} /> {prod.location}
                      </span>
                      <span>Stock: <strong>{prod.stock}</strong></span>
                    </div>
                    
                    <div className="product-card-meta-row" style={{ marginTop: '0.25rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', fontSize: '0.75rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <User size={12} /> {prod.sellerName.split(' (')[0]}
                      </span>
                      <span className="seller-rating-stars">
                        <Star size={11} fill="#fbbf24" style={{ color: '#fbbf24' }} />
                        {score}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- WALLAPOP STYLE PRODUCT DETAIL MODAL --- */}
      {selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '800px', width: '95%' }}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 800 }}>{selectedProduct.title}</h3>
              <button className="nav-icon-btn" onClick={() => setSelectedProduct(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <div className="product-detail-body">
                
                {/* Left Side: Product Media & Descriptions */}
                <div>
                  {/* Image Carousel Wrapper */}
                  <div style={{ position: 'relative', width: '100%', height: '320px', backgroundColor: '#f0f0f0', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <img 
                      src={
                        (selectedProduct.images && selectedProduct.images.length > 0)
                          ? selectedProduct.images[activeImgIndex]
                          : (selectedProduct.image || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600')
                      } 
                      alt={`${selectedProduct.title} - Foto ${activeImgIndex + 1}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s ease' }}
                    />
                    
                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                      <>
                        {/* Prev Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const imgs = selectedProduct.images || [];
                            setActiveImgIndex(prev => (prev === 0 ? imgs.length - 1 : prev - 1));
                          }}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '10px',
                            transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            zIndex: 10
                          }}
                          title="Anterior"
                        >
                          <ChevronLeft size={20} />
                        </button>

                        {/* Next Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const imgs = selectedProduct.images || [];
                            setActiveImgIndex(prev => (prev === imgs.length - 1 ? 0 : prev + 1));
                          }}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            right: '10px',
                            transform: 'translateY(-50%)',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            zIndex: 10
                          }}
                          title="Siguiente"
                        >
                          <ChevronRight size={20} />
                        </button>

                        {/* Dots Indicators */}
                        <div style={{
                          position: 'absolute',
                          bottom: '15px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          gap: '6px',
                          zIndex: 10
                        }}>
                          {selectedProduct.images.map((_, idx) => (
                            <div
                              key={idx}
                              onClick={(e) => { e.stopPropagation(); setActiveImgIndex(idx); }}
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: idx === activeImgIndex ? 'var(--primary)' : 'rgba(255, 255, 255, 0.6)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                transform: idx === activeImgIndex ? 'scale(1.2)' : 'none'
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Heart Button Overlay */}
                    <button 
                      className={`favorite-heart-btn ${favorites.includes(selectedProduct.id) ? 'is-fav' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedProduct.id); }}
                      style={{ top: '15px', right: '15px', zIndex: 10 }}
                    >
                      <Heart size={20} fill={favorites.includes(selectedProduct.id) ? '#e63946' : 'transparent'} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>
                      {selectedProduct.price.toLocaleString('es-ES')} € 
                      <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}> / {selectedProduct.unit}</span>
                    </div>
                    <span className={`badge ${getCategoryBadgeClass(selectedProduct.category)}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
                      {getCategoryLabel(selectedProduct.category)}
                    </span>
                  </div>

                  <h5 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Descripción</h5>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {selectedProduct.description}
                  </p>

                  {/* Related products widget */}
                  {relatedProducts.length > 0 && (
                    <div className="related-products-header">
                      <h5 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>Anuncios sugeridos</h5>
                      <div className="related-products-grid">
                        {relatedProducts.map(rel => (
                          <div 
                            key={rel.id} 
                            className="related-product-card"
                            onClick={() => setSelectedProduct(rel)}
                          >
                            <img src={rel.image} alt={rel.title} className="related-product-img" />
                            <div className="related-product-body">
                              <h6 className="related-product-title">{rel.title}</h6>
                              <div className="related-product-price">{rel.price} €</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Seller Card Info and Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Seller Profile Card */}
                  <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-light)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1.2rem'
                      }}>
                        {selectedProduct.sellerName.charAt(0)}
                      </div>
                      <div>
                        <h6 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{selectedProduct.sellerName.split(' (')[0]}</h6>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                          Profesional: {selectedProduct.sellerRole === 'farmer' ? 'Agricultor' : selectedProduct.sellerRole === 'supplier' ? 'Proveedor' : 'Distribuidor'}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating Info */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      <span className="seller-rating-stars" style={{ fontSize: '1rem' }}>
                        <Star size={14} fill="#fbbf24" style={{ color: '#fbbf24' }} />
                        {getSellerRating(selectedProduct.sellerId).score}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        ({getSellerRating(selectedProduct.sellerId).reviewsCount} valoraciones)
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', color: 'var(--text)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} style={{ color: 'var(--primary-light)' }} />
                        <span>Identidad verificada en AgroLink</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                        <span>Ubicación: <strong>{selectedProduct.location}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShoppingBag size={16} style={{ color: 'var(--text-muted)' }} />
                        <span>Disponibilidad: <strong>{selectedProduct.stock} {selectedProduct.unit}s</strong></span>
                      </div>
                    </div>

                    {/* Chat and Call buttons */}
                    {user?.id !== selectedProduct.sellerId ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.25rem' }}>
                        <button 
                          className="btn btn-primary btn-full"
                          onClick={() => handleContactSeller(selectedProduct.sellerId, selectedProduct.sellerName, selectedProduct.title)}
                        >
                          <MessageSquare size={16} />
                          Enviar Mensaje
                        </button>
                        {revealedPhoneProductId === selectedProduct.id ? (
                          <div style={{
                            padding: '0.75rem',
                            backgroundColor: 'rgba(82, 183, 136, 0.1)',
                            border: '1px solid var(--primary-light)',
                            borderRadius: 'var(--radius-sm)',
                            textAlign: 'center',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            marginTop: '0.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            animation: 'fadeIn 0.2s ease-out'
                          }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Teléfono del Vendedor:</span>
                            <a href={`tel:+34688223344`} style={{ color: 'var(--primary-dark)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <Phone size={14} /> +34 688 {selectedProduct.sellerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 900 + 100} {selectedProduct.sellerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 900 + 100}
                            </a>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Llamar en horario comercial</span>
                          </div>
                        ) : (
                          <button 
                            className="btn btn-secondary btn-full"
                            onClick={() => setRevealedPhoneProductId(selectedProduct.id)}
                          >
                            <Phone size={16} />
                            Llamar al Vendedor
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ marginTop: '1rem' }}>
                        <div style={{ 
                          padding: '0.5rem', 
                          backgroundColor: 'rgba(45, 106, 79, 0.1)', 
                          color: 'var(--primary-dark)',
                          borderRadius: 'var(--radius-sm)', 
                          fontSize: '0.8rem', 
                          textAlign: 'center',
                          fontWeight: 700,
                          marginBottom: '0.5rem'
                        }}>
                          Anuncio publicado por ti
                        </div>
                        
                        {/* Owner delete button inside modal */}
                        <button 
                          className="btn btn-danger btn-full"
                          style={{ backgroundColor: 'var(--danger)', color: 'white', border: 'none' }}
                          onClick={() => setProductToDelete(selectedProduct)}
                        >
                          Retirar Anuncio
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => { setSelectedProduct(null); setRevealedPhoneProductId(null); }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PUBLISH PRODUCT MODAL --- */}
      {isPublishModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '620px', width: '95%' }}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 800 }}>Publicar Nuevo Anuncio</h3>
              <button className="nav-icon-btn" onClick={() => setIsPublishModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePublishProduct}>
              <div className="modal-body" style={{ maxHeight: '75vh' }}>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="new-title-input">Título del Anuncio *</label>
                  <input 
                    id="new-title-input"
                    type="text" 
                    className="form-control" 
                    placeholder="Ej. Cebada de invierno seleccionada, Tractor semi-nuevo, etc."
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-category-select">Categoría *</label>
                    <select 
                      id="new-category-select"
                      className="form-control"
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                      required
                    >
                      <option value="crops">Cosechas (Productos Agrícolas)</option>
                      <option value="seeds">Semillas y Plantas</option>
                      <option value="machinery">Alquiler/Venta Maquinaria</option>
                      <option value="inputs">Fertilizantes e Insumos</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-location-input">Provincia *</label>
                    <select 
                      id="new-location-input"
                      className="form-control" 
                      value={prodLocation}
                      onChange={(e) => setProdLocation(e.target.value)}
                      required
                    >
                      <option value="">Selecciona provincia...</option>
                      {PROVINCIAS_ESPANA.map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-price-input">Precio Unitario (€) *</label>
                    <input 
                      id="new-price-input"
                      type="number" 
                      step="0.01" 
                      className="form-control" 
                      placeholder="Ej. 120"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-unit-input">Unidad de Venta *</label>
                    <select 
                      id="new-unit-input"
                      className="form-control" 
                      value={prodUnit}
                      onChange={(e) => setProdUnit(e.target.value)}
                      required
                    >
                      <option value="kg">kg (Kilogramos)</option>
                      <option value="Tonelada">Tonelada</option>
                      <option value="Unidad">Unidad</option>
                      <option value="Saco">Saco</option>
                      <option value="Caja">Caja</option>
                      <option value="Litro">Litro</option>
                      <option value="Palet">Palet</option>
                      <option value="Día">Día (Alquiler)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-stock-input">Stock Disponible *</label>
                    <input 
                      id="new-stock-input"
                      type="number" 
                      className="form-control" 
                      placeholder="Ej. 1500"
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Preset Crop Images Selector */}
                <div className="form-group">
                  <label className="image-presets-label">Selecciona una imagen de catálogo para tu anuncio</label>
                  <div className="image-presets-grid">
                    {IMAGE_PRESETS.map((preset) => (
                      <img 
                        key={preset.name}
                        src={preset.url}
                        alt={preset.name}
                        className={`image-preset-thumbnail ${selectedPresetUrl === preset.url ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedPresetUrl(preset.url);
                          setCustomImageUrl('');
                          setUploadedImages([]);
                        }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="new-image-custom">O introduce una URL de imagen propia (Opcional)</label>
                  <input 
                    id="new-image-custom"
                    type="url" 
                    className="form-control" 
                    placeholder="https://ejemplo.com/mi-foto-campo.jpg"
                    value={customImageUrl}
                    onChange={(e) => {
                      setCustomImageUrl(e.target.value);
                      setSelectedPresetUrl('');
                      setUploadedImages([]);
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sube fotos desde tu galería / cámara (Máximo 5)</label>
                  
                  {/* Thumbnails of currently selected files */}
                  {uploadedImages.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem', marginTop: '0.5rem' }}>
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <img src={img} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              background: 'rgba(230, 57, 70, 0.9)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '18px',
                              height: '18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0
                            }}
                            title="Quitar foto"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '1.25rem 1rem', 
                    border: '2px dashed var(--border)', 
                    borderRadius: 'var(--radius-sm)', 
                    cursor: 'pointer', 
                    textAlign: 'center',
                    backgroundColor: 'rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease',
                    marginTop: '0.5rem'
                  }} className="upload-dropzone">
                    <Plus size={20} style={{ color: 'var(--primary)', marginBottom: '0.25rem' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Seleccionar fotos de galería</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Puedes elegir una o varias imágenes</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        setUploadingFile(true);
                        try {
                          const promises = files.map(file => resizeImage(file));
                          const base64s = await Promise.all(promises);
                          setUploadedImages(prev => [...prev, ...base64s].slice(0, 5));
                          setCustomImageUrl('');
                          setSelectedPresetUrl('');
                        } catch (err) {
                          console.error('Error compressing images', err);
                        } finally {
                          setUploadingFile(false);
                        }
                      }}
                    />
                  </label>
                  {uploadingFile && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.25rem', display: 'block' }}>
                      Procesando y optimizando imágenes...
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="new-desc-textarea">Descripción de las Condiciones y Detalles *</label>
                  <textarea 
                    id="new-desc-textarea"
                    rows={4} 
                    className="form-control" 
                    placeholder="Describe las características técnicas, rendimiento, variedad de semilla, si incluyes transporte, estado de la maquinaria..."
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsPublishModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Publicar Anuncio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PRODUCT DELETE CONFIRM MODAL --- */}
      {productToDelete && (
        <div className="modal-overlay" style={{ zIndex: 2000 }}>
          <div className="modal-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-body" style={{ padding: '2rem 1.5rem' }}>
              <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem', marginLeft: 'auto', marginRight: 'auto' }} />
              <h3 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>¿Retirar Anuncio?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                ¿Estás seguro de que deseas retirar <strong>{productToDelete.title}</strong> de la venta?
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setProductToDelete(null)}>
                  Cancelar
                </button>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  style={{ backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}
                  onClick={async () => {
                    try {
                      await marketService.deleteProduct(productToDelete.id);
                      setProductToDelete(null);
                      setSelectedProduct(null);
                      triggerAlert('Anuncio retirado del mercado correctamente.', 'success');
                      loadProducts();
                    } catch (err) {
                      console.error(err);
                      triggerAlert('Error al retirar el anuncio.', 'danger');
                    }
                  }}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
