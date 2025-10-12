import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  Email,
  Phone,
  LocationOn,
  Favorite,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Paper
      component="footer"
      sx={{
        mt: 'auto',
        backgroundColor: '#2c2c2c',
        color: 'white',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Información de la empresa */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  color: '#8B4513',
                }}
              >
                🍪 Kapola Ibagué.
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                Las mejores galletas estilo New York, horneadas con amor y los ingredientes más frescos.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  size="small"
                   href="https://www.facebook.com/kapolaaa"
                   target="_blank"
                   rel="noopener noreferrer"
                  sx={{ color: 'white', '&:hover': { color: '#8B4513' } }}
                >
                  <Facebook />
                </IconButton>
                <IconButton
                  size="small"
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'white', '&:hover': { color: '#8B4513' } }}
                >
                  <Twitter />
                </IconButton>
                <IconButton
                  size="small"
                  href="https://www.instagram.com/kapola_ibague"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'white', '&:hover': { color: '#8B4513' } }}
                >
                  <Instagram />
                </IconButton>
              </Box>
            </Box>
          </Grid>

          {/* Enlaces rápidos */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Enlaces
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" sx={{ textDecoration: 'none', '&:hover': { color: '#8B4513' } }}>
                Inicio
              </Link>
              <Link href="/products" color="inherit" sx={{ textDecoration: 'none', '&:hover': { color: '#8B4513' } }}>
                Productos
              </Link>
              <Link href="/about" color="inherit" sx={{ textDecoration: 'none', '&:hover': { color: '#8B4513' } }}>
                Nosotros
              </Link>
              <Link href="/contact" color="inherit" sx={{ textDecoration: 'none', '&:hover': { color: '#8B4513' } }}>
                Contacto
              </Link>
            </Box>
          </Grid>

          {/* Soporte */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Soporte
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/help" color="inherit" sx={{ textDecoration: 'none', '&:hover': { color: '#8B4513' } }}>
                Ayuda
              </Link>
              <Link href="/shipping" color="inherit" sx={{ textDecoration: 'none', '&:hover': { color: '#8B4513' } }}>
                Envíos
              </Link>
              <Link href="/returns" color="inherit" sx={{ textDecoration: 'none', '&:hover': { color: '#8B4513' } }}>
                Devoluciones
              </Link>
              <Link href="/faq" color="inherit" sx={{ textDecoration: 'none', '&:hover': { color: '#8B4513' } }}>
                Preguntas Frecuentes
              </Link>
            </Box>
          </Grid>

          {/* Información de contacto */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Contacto
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: '#8B4513', fontSize: 20 }} />
                <Typography variant="body2">
                  Ciudadela Comfenalco, Ibagué.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ color: '#8B4513', fontSize: 20 }} />
                <Typography variant="body2">
                  +57 (323) 944-5435
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ color: '#8B4513', fontSize: 20 }} />
                <Typography variant="body2">
                  Kapola@gmail.com
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} Kapola. Todos los derechos reservados.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Hecho con
            </Typography>
            <Favorite sx={{ color: '#e91e63', fontSize: 16 }} />
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              en Colombia
            </Typography>
          </Box>
        </Box>
      </Container>
    </Paper>
  );
};

export default Footer;
