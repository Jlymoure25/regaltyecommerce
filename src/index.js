import React, { createContext, useContext, useReducer, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './index.css';

// Simple cart state management
const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => 
        item.id === action.payload.id && 
        item.selectedSize === action.payload.selectedSize &&
        item.selectedGender === action.payload.selectedGender &&
        item.customText === action.payload.customText
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id && 
            item.selectedSize === action.payload.selectedSize &&
            item.selectedGender === action.payload.selectedGender &&
            item.customText === action.payload.customText
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => 
          !(item.id === action.payload.id && 
            item.selectedSize === action.payload.selectedSize &&
            item.selectedGender === action.payload.selectedGender &&
            item.customText === action.payload.customText)
        )
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };
    case 'ADD_TO_WISHLIST':
      const isInWishlist = state.wishlist.find(item => item.id === action.payload.id);
      if (isInWishlist) {
        return state;
      }
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload]
      };
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter(item => item.id !== action.payload.id)
      };
    case 'CLEAR_WISHLIST':
      return {
        ...state,
        wishlist: []
      };
    default:
      return state;
  }
};

const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, { items: [], wishlist: [] });
  
  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };
  
  const removeFromCart = (item) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: item });
  };
  
  const addToWishlist = (product) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
  };
  
  const removeFromWishlist = (product) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product });
  };
  
  const isInWishlist = (productId) => {
    return cart.wishlist.some(item => item.id === productId);
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  const getTotalItems = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };
  
  const getTotalPrice = () => {
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a 0%, #6b7280 50%, #1f2937 100%)' }}>
          <Header />
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '15px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </CartProvider>
  );
}

function Header() {
  return (
    <header style={{ 
      background: 'linear-gradient(135deg, #1e3a8a 0%, #6b7280 50%, #1f2937 100%)', 
      color: 'white', 
      padding: '1rem 0', 
      marginBottom: '2rem',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
    }}>
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <Link to="/" style={{ 
          color: 'white', 
          textDecoration: 'none', 
          fontSize: '4.5rem', 
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #3b82f6, #9ca3af, #374151, #1f2937)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textAlign: 'center',
          flex: '1',
          display: 'block'
        }}>
          👑 REGALTY
        </Link>

      </nav>
    </header>
  );
}

function ProductCard({ product, index, addToCart }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedGender, setSelectedGender] = useState('men');
  const [customText, setCustomText] = useState('');
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(CartContext);
  
  // Safe image URL generator for custom text
  const getCustomImageUrl = (text) => {
    try {
      if (!text || !text.trim()) return product.image;
      const cleanText = text.trim().substring(0, 15);
      // Use placehold.co which updates instantly
      return `https://placehold.co/400x500/808080/white?text=${encodeURIComponent(cleanText)}&font=roboto`;
    } catch (error) {
      console.warn('Error generating custom image URL:', error);
      return product.image;
    }
  };
  
  const cardColors = [
    'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
    'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
    'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
    'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)',
    'linear-gradient(135deg, #1e40af 0%, #374151 100%)'
  ];

  const handleAddToCart = () => {
    if (product.sizes && !selectedSize) {
      alert('Please select a size before adding to cart!');
      return;
    }
    
    const productWithDetails = {
      ...product,
      selectedSize: selectedSize || undefined,
      selectedGender: product.sizes && typeof product.sizes === 'object' ? selectedGender : undefined,
      customText: product.customizable ? customText.trim() : undefined,
      uniqueId: `${product.id}-${selectedSize}-${customText.trim()}-${Date.now()}`
    };
    
    try {
      addToCart(productWithDetails);
      alert(`✅ ${product.title}${customText ? ` with "${customText}"` : ''} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('❌ Error adding item to cart. Please try again.');
    }
  };
  
  const toggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div key={product.id} style={{ 
      background: cardColors[index % cardColors.length],
      borderRadius: '20px',
      padding: '1.5rem',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      transition: 'transform 0.3s, box-shadow 0.3s',
      cursor: 'pointer',
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      e.target.style.transform = 'translateY(-10px)';
      e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
    }}
    onMouseLeave={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
    }}>
      {/* Wishlist Heart Icon */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist();
        }}
        style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '18px',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.background = 'rgba(255,255,255,1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.background = 'rgba(255,255,255,0.9)';
        }}
      >
        {isInWishlist(product.id) ? '❤️' : '🤍'}
      </div>
      <img
        key={`${product.id}-${customText}-${Date.now()}`}
        src={product.customizable && customText.trim() 
          ? `${getCustomImageUrl(customText)}&t=${Date.now()}`
          : product.image
        }
        alt={product.title}
        style={{
          width: '100%',
          height: '200px',
          objectFit: 'cover',
          marginBottom: '1rem',
          borderRadius: '15px',
          border: '3px solid rgba(255,255,255,0.5)',
          transition: 'opacity 0.3s ease'
        }}
        onError={(e) => {
          // Fallback to original image if custom text image fails to load
          if (e.target.src !== product.image) {
            e.target.src = product.image;
          }
        }}
        onLoad={() => {
          // Optional: Add any loading effects here
        }}
      />
      <h3 style={{ 
        fontSize: '1.2rem', 
        marginBottom: '0.5rem', 
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        fontWeight: 'bold'
      }}>
        {product.title}
      </h3>
      <p style={{ 
        color: 'white', 
        fontWeight: 'bold', 
        fontSize: '1.3rem', 
        marginBottom: '0.5rem',
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
      }}>
        ${product.price.toFixed(2)}
      </p>
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: '0.3rem 0.8rem',
        borderRadius: '20px',
        fontSize: '0.9rem',
        marginBottom: '0.5rem',
        display: 'inline-block',
        color: '#333',
        fontWeight: 'bold'
      }}>
        {product.category}
      </div>
      
      {/* Size Selection */}
      {product.sizes && (
        <div style={{ marginBottom: '0.5rem' }}>
          {Array.isArray(product.sizes) ? (
            // T-shirt sizes dropdown
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: '0.9rem',
                display: 'block',
                marginBottom: '0.3rem',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}>
                Select Size:
              </label>
              <select 
                value={selectedSize} 
                onChange={(e) => setSelectedSize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                <option value="">Choose size...</option>
                {product.sizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          ) : (
            // Shoe sizes with gender selection
            <div>
              <label style={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: '0.9rem',
                display: 'block',
                marginBottom: '0.3rem',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}>
                Select Gender:
              </label>
              <select 
                value={selectedGender} 
                onChange={(e) => {
                  setSelectedGender(e.target.value);
                  setSelectedSize(''); // Reset size when gender changes
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  color: '#333',
                  cursor: 'pointer',
                  marginBottom: '0.5rem'
                }}
              >
                <option value="men">Men's</option>
                <option value="women">Women's</option>
              </select>
              
              <label style={{ 
                color: 'white', 
                fontWeight: 'bold', 
                fontSize: '0.9rem',
                display: 'block',
                marginBottom: '0.3rem',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}>
                Select Size:
              </label>
              <select 
                value={selectedSize} 
                onChange={(e) => setSelectedSize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  color: '#333',
                  cursor: 'pointer'
                }}
              >
                <option value="">Choose size...</option>
                {product.sizes[selectedGender].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
      
      <p style={{
        color: 'rgba(255,255,255,0.9)',
        fontSize: '0.9rem',
        marginBottom: '1rem',
        lineHeight: 1.4,
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
      }}>
        {product.description}
      </p>
      
      {/* Custom Text Input for Customizable Products */}
      {product.customizable && (
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ 
            color: 'white', 
            fontWeight: 'bold', 
            fontSize: '0.9rem',
            display: 'block',
            marginBottom: '0.3rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            🎨 Add Your Custom Text:
          </label>
          <input
            type="text"
            value={customText}
            onChange={(e) => {
              const value = e.target.value;
              // Allow only alphanumeric characters, spaces, and common punctuation
              const sanitized = value.replace(/[^a-zA-Z0-9 !@#$%&*()_+={}|;':",./<>?-]/g, '');
              setCustomText(sanitized);
            }}
            placeholder="Type your text here... (e.g., Your Name)"
            style={{
              width: '100%',
              padding: '0.7rem',
              borderRadius: '10px',
              border: customText.trim() ? '2px solid #28a745' : '2px solid transparent',
              fontSize: '0.9rem',
              backgroundColor: 'rgba(255,255,255,0.95)',
              color: '#333',
              marginBottom: '0.5rem',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s ease'
            }}
            maxLength={15}
          />
          <div style={{ textAlign: 'center' }}>
            <p style={{
              color: customText.trim() ? 'rgba(144,238,144,0.9)' : 'rgba(255,255,255,0.8)',
              fontSize: '0.8rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              margin: '0 0 0.3rem 0',
              fontWeight: 'bold'
            }}>
              {customText.trim() 
                ? `✨ "${customText}" will be printed on your hoodie! ✨`
                : '✨ Your text will appear on the hoodie as you type! ✨'
              }
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.7rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              margin: '0'
            }}>
              {customText.length}/15 characters
            </p>
          </div>
        </div>
      )}
      
      <button
        onClick={handleAddToCart}
        style={{
          background: 'linear-gradient(45deg, #28a745, #20c997)',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '25px',
          cursor: 'pointer',
          width: '100%',
          fontSize: '1rem',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(40,167,69,0.3)',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
        }}
      >
        ✨ Add to Cart ✨
      </button>
    </div>
  );
}

function Home() {
  const { addToCart, getTotalItems } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulate loading when filters change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300); // 300ms loading simulation
    
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, sortBy]);
  
  const sampleProducts = [
    { 
      id: 1, 
      title: "Royal Crown Hoodie", 
      price: 299.99, 
      description: "Premium luxury hoodie with royal crown embroidery. Made from the finest organic cotton blend with custom personalization options.",
      category: "luxury-apparel",
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      image: "https://images.pexels.com/photos/15127553/pexels-photo-15127553.jpeg",
      customizable: true,
      features: ["Organic Cotton Blend", "Crown Embroidery", "Custom Text Available", "Luxury Packaging"]
    },
    { 
      id: 2, 
      title: "Executive Timepiece", 
      price: 1299.99, 
      description: "Swiss-made executive timepiece with royal blue face and premium leather strap. Perfect for the discerning professional.",
      category: "premium-accessories",
      image: "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500",
      customizable: true,
      features: ["Swiss Movement", "Sapphire Crystal", "Leather Strap", "Water Resistant"]
    },
    { 
      id: 3, 
      title: "Platinum Executive Business Card Holder", 
      price: 299.99, 
      description: "Exquisite platinum-finished business card holder featuring sophisticated design elements and royal blue luxury accents. This premium executive accessory ensures you make an unforgettable impression in every professional encounter.",
      category: "premium-accessories",
      image: "https://images.pexels.com/photos/13370907/pexels-photo-13370907.jpeg",
      customizable: true,
      features: ["Premium Platinum Finish", "Royal Blue Luxury Accents", "Magnetic Secure Closure", "Custom Engraving Available"]
    },
    { 
      id: 4, 
      title: "Royal Signature Pen Set", 
      price: 449.99, 
      description: "Premium fountain pen set with royal blue and gray accents. Each pen is individually crafted with precision engineering.",
      category: "premium-accessories",
      image: "https://images.pexels.com/photos/403075/pexels-photo-403075.jpeg",
      customizable: true,
      features: ["Gold Nib", "Premium Ink", "Gift Box", "Lifetime Warranty"]
    },
    { 
      id: 5, 
      title: "Luxury Portfolio Briefcase", 
      price: 899.99, 
      description: "Handcrafted leather briefcase with royal blue interior. Perfect for executives who demand excellence in every detail.",
      category: "premium-accessories",
      image: "https://images.pexels.com/photos/2977304/pexels-photo-2977304.jpeg",
      customizable: true,
      features: ["Italian Leather", "Royal Blue Interior", "Multiple Compartments", "Security Lock"]
    },
    { 
      id: 6, 
      title: "Elite Crystal Decanter Set", 
      price: 649.99, 
      description: "Hand-blown crystal decanter set with royal blue trim. Elevate your entertaining with this exquisite collection.",
      category: "luxury-home",
      image: "https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg",
      customizable: true,
      features: ["Hand-Blown Crystal", "Royal Blue Trim", "6-Piece Set", "Gift Ready"]
    }
  ];
  
  // Filter and search logic
  const filteredProducts = sampleProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name-az':
        return a.title.localeCompare(b.title);
      case 'name-za':
        return b.title.localeCompare(a.title);
      default:
        return 0; // Keep original order
    }
  });
  
  const categories = ['all', ...new Set(sampleProducts.map(product => product.category))];
  
  return (
    <div>
      {/* Welcome Section with Cart Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div>
          <h1 style={{ 
            marginBottom: '0.5rem', 
            color: '#1e3a8a',
            textAlign: 'left',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            fontFamily: 'Playfair Display, serif'
          }}>
            Regalty
          </h1>
          <p style={{ 
            marginBottom: '0.5rem', 
            color: '#4a5568',
            textAlign: 'left',
            fontSize: '1.4rem',
            fontWeight: '300',
            fontFamily: 'Inter, sans-serif'
          }}>
            ✨ Premium Luxury E-commerce Experience ✨
          </p>
          <p style={{ 
            marginBottom: '0', 
            color: '#666',
            textAlign: 'left',
            fontSize: '1.1rem',
            fontWeight: 'normal',
            fontFamily: 'Inter, sans-serif'
          }}>
            Discover exclusive products with custom personalization
          </p>
        </div>
        
        {/* Cart Button in Right Corner */}
        <Link to="/cart">
          <button style={{
            background: 'linear-gradient(45deg, #ff8c00, #1e3a8a)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(255,140,0,0.3)',
            transition: 'transform 0.2s',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}>
            🛒 Cart ({getTotalItems()})
          </button>
        </Link>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section" style={{
        margin: '30px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        alignItems: 'center'
      }}>
        {/* Search Bar */}
        <div className="search-container" style={{
          width: '100%',
          maxWidth: '400px',
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: '25px',
              border: '2px solid #e0e0e0',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.3s ease',
              background: 'white'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff6b6b'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>
        
        {/* Category Filter */}
        <div className="category-filter" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center'
        }}>
          {categories.map(category => {
            const categoryInfo = {
              'all': { name: '👑 All Luxury Items', count: sampleProducts.length },
              'luxury-apparel': { name: '👔 Luxury Apparel', count: sampleProducts.filter(p => p.category === 'luxury-apparel').length },
              'premium-accessories': { name: '💎 Premium Accessories', count: sampleProducts.filter(p => p.category === 'premium-accessories').length },
              'luxury-home': { name: '🏰 Luxury Home', count: sampleProducts.filter(p => p.category === 'luxury-home').length }
            };
            const info = categoryInfo[category] || { name: category, count: 0 };
            
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '25px',
                    border: selectedCategory === category ? 'none' : '2px solid rgba(30, 58, 138, 0.1)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    background: selectedCategory === category 
                      ? 'linear-gradient(135deg, #1e3a8a, #3730a3)' 
                      : 'rgba(255,255,255,0.9)',
                    color: selectedCategory === category ? 'white' : '#1e3a8a',
                    transform: selectedCategory === category ? 'translateY(-2px)' : 'none',
                    boxShadow: selectedCategory === category 
                      ? '0 8px 25px rgba(30, 58, 138, 0.4)' 
                      : '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
                      e.target.style.background = 'linear-gradient(135deg, rgba(30, 58, 138, 0.1), rgba(55, 48, 163, 0.1))';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category) {
                      e.target.style.transform = 'none';
                      e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                      e.target.style.background = 'rgba(255,255,255,0.9)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{info.name}</div>
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>{info.count} items</div>
                  </div>
                </button>
              );
            })}
        </div>
        
        {/* Sort Dropdown */}
        <div className="sort-dropdown" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <label style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#333'
          }}>
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '15px',
              border: '2px solid #e0e0e0',
              fontSize: '14px',
              background: 'white',
              cursor: 'pointer',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff6b6b'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          >
            <option value="default">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name-az">Name: A to Z</option>
            <option value="name-za">Name: Z to A</option>
          </select>
        </div>
        
        {/* Results Count */}
        <div style={{
          fontSize: '14px',
          color: '#666',
          fontWeight: '500'
        }}>
          Showing {sortedProducts.length} of {sampleProducts.length} products
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '15px'
      }}>
        {isLoading ? (
          // Loading skeleton cards
          Array.from({ length: 6 }, (_, index) => (
            <div key={`skeleton-${index}`} style={{
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'loading 1.5s infinite',
              borderRadius: '20px',
              padding: '1.5rem',
              height: '400px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                height: '200px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '15px',
                marginBottom: '1rem'
              }}></div>
              <div style={{
                width: '80%',
                height: '24px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '12px',
                marginBottom: '0.5rem'
              }}></div>
              <div style={{
                width: '60%',
                height: '20px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '10px',
                marginBottom: '1rem'
              }}></div>
              <div style={{
                width: '40%',
                height: '32px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '16px'
              }}></div>
            </div>
          ))
        ) : (
          sortedProducts.map((product, index) => (
            <ProductCard 
              key={product.id}
              product={product}
              index={index}
              addToCart={addToCart}
            />
          ))
        )}
      </div>
    </div>
  );
}

function Cart() {
  const { cart, removeFromCart, clearCart, getTotalPrice } = useCart();
  
  if (cart.items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ 
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '2.5rem'
        }}>
          Shopping Cart
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
          Your cart is empty. Start shopping to add items!
        </p>
        <Link to="/">
          <button style={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(102,126,234,0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}>
            🛍️ Continue Shopping
          </button>
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <h1 style={{ 
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)', 
        WebkitBackgroundClip: 'text', 
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontSize: '2.5rem',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        Shopping Cart
      </h1>
      <div style={{ marginBottom: '20px' }}>
        {cart.items.map((item, index) => {
          const cardColors = [
            'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
          ];
          
          return (
            <div key={item.id} style={{
              background: cardColors[index % cardColors.length],
              borderRadius: '20px',
              padding: '1.5rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            }}>
              <img
                src={item.image}
                alt={item.title}
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  objectFit: 'cover', 
                  borderRadius: '15px',
                  border: '3px solid rgba(255,255,255,0.5)'
                }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  marginBottom: '0.5rem', 
                  color: 'white',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  fontSize: '1.2rem'
                }}>
                  {item.title}
                </h3>
                {item.selectedSize && (
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    color: '#333',
                    fontWeight: 'bold',
                    display: 'inline-block',
                    marginBottom: '0.5rem'
                  }}>
                    {item.selectedGender ? `${item.selectedGender === 'men' ? 'Men\'s' : 'Women\'s'} Size: ${item.selectedSize}` : `Size: ${item.selectedSize}`}
                  </div>
                )}
                <p style={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}>
                  ${item.price.toFixed(2)} each
                </p>
                <p style={{ color: 'rgba(255,255,255,0.9)' }}>Quantity: {item.quantity}</p>
                <p style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  Subtotal: ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
              <button 
                onClick={() => removeFromCart(item)}
                style={{
                  background: 'linear-gradient(45deg, #dc3545, #c82333)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(220,53,69,0.3)'
                }}
              >
                🗑️ Remove
              </button>
            </div>
          );
        })}
      </div>
      
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        color: 'white'
      }}>
        <h2 style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Cart Summary</h2>
        <div style={{ marginBottom: '15px', fontSize: '1.1rem' }}>
          <strong>Total Items: {cart.items.reduce((total, item) => total + item.quantity, 0)}</strong>
        </div>
        <div style={{ marginBottom: '25px', fontSize: '1.5rem' }}>
          <strong>Total Price: ${getTotalPrice().toFixed(2)}</strong>
        </div>
        <button 
          onClick={() => {
            clearCart();
            alert('🎉 Checkout successful! Thank you for shopping with Regalty!');
          }}
          style={{
            background: 'linear-gradient(45deg, #28a745, #20c997)',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '25px',
            cursor: 'pointer',
            marginRight: '15px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(40,167,69,0.3)'
          }}
        >
          ✨ Checkout ✨
        </button>
        <Link to="/">
          <button style={{
            background: 'linear-gradient(45deg, #6c757d, #5a6268)',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(108,117,125,0.3)'
          }}>
            🛍️ Continue Shopping
          </button>
        </Link>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);