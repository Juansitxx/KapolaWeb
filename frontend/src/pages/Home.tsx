import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  ArrowForward,
  CardGiftcard,
  Cookie,
  Inventory,
  LocalShipping,
  ShoppingCart,
  Storefront,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/api';
import { Product } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        setLoading(true);
        const response = await productService.getProducts({ limit: 4 });
        setFeaturedProducts(response.products);
      } catch (err) {
        setError('No pudimos cargar los productos destacados.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFeatured();
  }, []);

  const orderOptions = [
    { icon: <LocalShipping />, title: 'Domicilio', text: 'Recibe tus galletas donde estes.' },
    { icon: <Storefront />, title: 'Recogida', text: 'Pide antes y pasa por tu pedido.' },
  ];

  const productTypes = [
    { icon: <Cookie />, title: 'Galletas individuales', text: 'Sabores clasicos y especiales.' },
    { icon: <Inventory />, title: 'Cajas x4 y x6', text: 'Ideales para compartir o regalar.' },
    { icon: <CardGiftcard />, title: 'Combos y temporada', text: 'Opciones para fechas especiales.' },
  ];

  return (
    <Box>
      <Box
        sx={{
          bgcolor: '#fff7f8',
          borderBottom: '1px solid rgba(238, 156, 167, 0.18)',
        }}
      >
        <Container maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Chip label="Galletas tipo New York en Ibague" sx={{ mb: 2, bgcolor: '#ffdde1', color: '#7a3b45', fontWeight: 900 }} />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.6rem', sm: '3.6rem', md: '5rem' },
                  lineHeight: 1,
                  fontWeight: 950,
                  color: '#332025',
                  maxWidth: 760,
                  mb: 2,
                }}
              >
                Galletas calientes, cajas listas y pedidos sin enredos.
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 680, mb: 3 }}>
                KapolaWeb organiza el menu, el carrito y los pedidos para que comprar galletas sea rapido y claro.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={() => navigate('/ordenar')}
                  sx={{ bgcolor: '#ee9ca7', py: 1.45, px: 4, fontWeight: 900, '&:hover': { bgcolor: '#d98291' } }}
                >
                  Ordenar ahora
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => document.getElementById('recibir-pedido')?.scrollIntoView({ behavior: 'smooth' })}
                  sx={{ py: 1.45, px: 3, fontWeight: 900, borderColor: '#b85c69', color: '#7a3b45' }}
                >
                  Como recibir mi pedido
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                  bgcolor: 'white',
                  border: '1px solid rgba(238, 156, 167, 0.22)',
                  boxShadow: '0 24px 60px rgba(74, 35, 41, 0.12)',
                }}
              >
                <Box
                  sx={{
                    height: { xs: 260, md: 360 },
                    borderRadius: 2,
                    bgcolor: '#ffdde1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(circle at 28% 25%, #ffffff 0 10%, transparent 11%), linear-gradient(135deg, #ffdde1 0%, #ee9ca7 100%)',
                  }}
                >
                  <Cookie sx={{ fontSize: { xs: 120, md: 180 }, color: '#fff7f8', filter: 'drop-shadow(0 18px 24px rgba(74,35,41,0.16))' }} />
                </Box>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }} useFlexGap flexWrap="wrap">
                  <Chip label="New York" />
                  <Chip label="Red Velvet" />
                  <Chip label="Cajas" />
                  <Chip label="Combos" />
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Box id="recibir-pedido" sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ color: '#b85c69', fontWeight: 900 }}>
            Primer paso
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 950, color: '#332025', mb: 2 }}>
            Como quieres recibir tu pedido?
          </Typography>
          <Grid container spacing={2.5}>
            {orderOptions.map((option) => (
              <Grid item xs={12} md={6} key={option.title}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid rgba(238, 156, 167, 0.22)', bgcolor: '#fff7f8' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{ color: '#b85c69' }}>{option.icon}</Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 900 }}>{option.title}</Typography>
                      <Typography color="text.secondary">{option.text}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ color: '#b85c69', fontWeight: 900 }}>
            Menu Kapola
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 950, color: '#332025', mb: 2 }}>
            Que puedes ordenar
          </Typography>
          <Grid container spacing={2.5}>
            {productTypes.map((item) => (
              <Grid item xs={12} md={4} key={item.title}>
                <CardLike icon={item.icon} title={item.title} text={item.text} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: 6 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="overline" sx={{ color: '#b85c69', fontWeight: 900 }}>
                Destacados
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 950, color: '#332025' }}>
                Productos populares
              </Typography>
            </Box>
            <Button endIcon={<ArrowForward />} onClick={() => navigate('/ordenar')} sx={{ fontWeight: 900, color: '#b85c69' }}>
              Ver menu completo
            </Button>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {loading ? (
            <Box sx={{ py: 5, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : featuredProducts.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography>No hay productos disponibles por ahora.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {featuredProducts.map((product) => (
                <Grid key={product.id} item xs={12} sm={6} md={3}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        <Paper id="ubicacion" elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: '#332025', color: 'white', borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" sx={{ fontWeight: 950, mb: 1 }}>
                Kapola en Ibague
              </Typography>
              <Typography sx={{ opacity: 0.86 }}>
                Atendemos pedidos para domicilio y recogida. Confirma disponibilidad y tiempos al finalizar tu pedido.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button fullWidth variant="contained" onClick={() => navigate('/ordenar')} sx={{ bgcolor: '#ee9ca7', fontWeight: 900, '&:hover': { bgcolor: '#d98291' } }}>
                Empezar pedido
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

const CardLike: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => (
  <Paper elevation={0} sx={{ height: '100%', p: 3, border: '1px solid rgba(238, 156, 167, 0.22)', bgcolor: 'white' }}>
    <Box sx={{ color: '#b85c69', mb: 1 }}>{icon}</Box>
    <Typography variant="h6" sx={{ fontWeight: 900, color: '#332025' }}>{title}</Typography>
    <Typography color="text.secondary">{text}</Typography>
  </Paper>
);

export default Home;
