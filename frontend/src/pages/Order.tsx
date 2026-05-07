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
  Stack,
} from '@mui/material';
import {
  Search,
  ShoppingCart,
  Tune,
} from '@mui/icons-material';
import { Product, SearchFilters } from '../types';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';

const Order: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsResponse, categoriesResponse] = await Promise.all([
        productService.getProducts({ limit: 30 }),
        productService.getCategories(),
      ]);

      setProducts(productsResponse.products);
      setCategories(categoriesResponse.categories);
    } catch (err) {
      setError('No pudimos cargar el menu. Intenta de nuevo.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const runSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: SearchFilters = { limit: 30 };

      if (searchQuery.trim()) filters.q = searchQuery.trim();
      if (selectedCategory) filters.category = selectedCategory;

      const response = filters.q
        ? await productService.searchProducts(filters)
        : await productService.getProducts(filters);

      setProducts(response.products);
    } catch (err) {
      setError('No pudimos filtrar el menu.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (category: string) => {
    const nextCategory = category === selectedCategory ? '' : category;
    setSelectedCategory(nextCategory);

    try {
      setLoading(true);
      setError(null);
      const filters: SearchFilters = { limit: 30 };
      if (nextCategory) filters.category = nextCategory;
      if (searchQuery.trim()) filters.q = searchQuery.trim();

      const response = filters.q
        ? await productService.searchProducts(filters)
        : await productService.getProducts(filters);

      setProducts(response.products);
    } catch (err) {
      setError('No pudimos filtrar por categoria.');
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

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          borderRadius: 2,
          bgcolor: '#fff7f8',
          border: '1px solid rgba(238, 156, 167, 0.24)',
        }}
      >
        <Grid container spacing={2.5} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="overline" sx={{ color: '#b85c69', fontWeight: 900 }}>
              Menu para ordenar
            </Typography>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 900, color: '#332025', mb: 1 }}>
              Elige tus galletas Kapola
            </Typography>
            <Typography color="text.secondary">
              Galletas individuales, cajas, combos y opciones de temporada listas para agregar al carrito.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              component="form"
              onSubmit={(event) => {
                event.preventDefault();
                runSearch();
              }}
              sx={{ display: 'flex', gap: 1 }}
            >
              <TextField
                fullWidth
                placeholder="Buscar por sabor, caja o combo"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
              />
              <Button type="submit" variant="contained" sx={{ minWidth: 56, bgcolor: '#ee9ca7', '&:hover': { bgcolor: '#d98291' } }}>
                <Search />
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Tune sx={{ color: '#b85c69' }} />
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Categorias
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip label="Todos" clickable color={!selectedCategory ? 'primary' : 'default'} onClick={handleClearFilters} sx={{ fontWeight: 800 }} />
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              clickable
              color={selectedCategory === category ? 'primary' : 'default'}
              onClick={() => handleCategoryFilter(category)}
              sx={{ fontWeight: 800 }}
            />
          ))}
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && products.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Cargando menu...</Typography>
        </Box>
      ) : products.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center' }}>
          <ShoppingCart sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 900 }}>No hay productos disponibles</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>Prueba con otra categoria o vuelve al menu completo.</Typography>
          <Button variant="contained" onClick={handleClearFilters}>Ver todo</Button>
        </Paper>
      ) : (
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {products.map((product) => (
            <Grid key={product.id} item xs={12} sm={6} md={4} lg={3}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Order;
