import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Search,
  FilterList,
  ShoppingCart,
  Star,
  TrendingUp,
} from '@mui/icons-material';
import { Product, SearchFilters } from '../types';
import { productService } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse, popularResponse] = await Promise.all([
        productService.getProducts({ limit: 8 }),
        productService.getCategories(),
        productService.getPopularProducts(6),
      ]);

      setProducts(productsResponse.products);
      setCategories(categoriesResponse.categories);
      setPopularProducts(popularResponse.products);
    } catch (err) {
      setError('Error al cargar los productos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const filters: SearchFilters = {
        q: searchQuery.trim(),
        limit: 8,
      };

      if (selectedCategory) {
        filters.category = selectedCategory;
      }

      const response = await productService.searchProducts(filters);
      setProducts(response.products);
    } catch (err) {
      setError('Error en la búsqueda');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (category: string) => {
    try {
      setLoading(true);
      setSelectedCategory(category === selectedCategory ? '' : category);
      
      const filters: SearchFilters = {
        limit: 8,
      };

      if (category !== selectedCategory) {
        filters.category = category;
      }

      const response = await productService.getProducts(filters);
      setProducts(response.products);
    } catch (err) {
      setError('Error al filtrar por categoría');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    loadInitialData();
  };

  if (loading && products.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando productos...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
          color: 'white',
          p: 6,
          mb: 4,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          🍪 Bienvenido a Kapola Ibagué.
        </Typography>
        <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
          ¡Descubre las mejores galletas  New York de la ciudad!.
        </Typography>

        {/* Búsqueda */}
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }} sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Buscar galletas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: '#8B4513',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <Search />
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Filtros */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h6">Filtrar por categoría:</Typography>
          <Button
            variant={showFilters ? 'contained' : 'outlined'}
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
          {(searchQuery || selectedCategory) && (
            <Button variant="text" onClick={handleClearFilters}>
              Limpiar filtros
            </Button>
          )}
        </Box>

        {showFilters && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                clickable
                color={selectedCategory === category ? 'primary' : 'default'}
                onClick={() => handleCategoryFilter(category)}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Productos populares */}
      {!searchQuery && !selectedCategory && popularProducts.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Productos Populares
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {popularProducts.map((product) => (
              <Grid key={product.id} xs={12} sm={6} md={4} lg={2}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Productos principales */}
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
          {searchQuery ? `Resultados para "${searchQuery}"` : 
           selectedCategory ? `Categoría: ${selectedCategory}` : 
           'Nuestros Productos'}
        </Typography>

        {products.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No se encontraron productos
            </Typography>
            <Button variant="contained" onClick={handleClearFilters} sx={{ mt: 2 }}>
              Ver todos los productos
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid key={product.id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* CTA Section */}
      {!isAuthenticated && (
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
            p: 4,
            mt: 6,
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            ¿Listo para hacer tu primer pedido?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Regístrate ahora y disfruta de nuestras deliciosas galletas
          </Typography>
          <Button
            variant="contained"
            size="large"
            href="/register"
            sx={{
              backgroundColor: '#8B4513',
              '&:hover': {
                backgroundColor: '#A0522D',
              },
            }}
          >
            Crear Cuenta
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default Home;
