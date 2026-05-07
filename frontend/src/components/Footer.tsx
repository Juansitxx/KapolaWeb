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
  Stack,
} from '@mui/material';
import {
  Instagram,
  Email,
  Phone,
  LocationOn,
  Favorite,
  Policy,
  LocalShipping,
} from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Paper
      component="footer"
      elevation={0}
      sx={{
        mt: 'auto',
        bgcolor: '#332025',
        color: 'white',
        py: { xs: 5, md: 6 },
        borderRadius: 0,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h4" sx={{ fontWeight: 950, color: '#ffdde1', mb: 1 }}>
              Kapola
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 360, opacity: 0.86, mb: 2 }}>
              Galletas tipo New York, cajas y combos para pedir en Ibague con una experiencia clara y organizada.
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                href="https://www.instagram.com/kapola_ibague"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { color: '#ffdde1' } }}
              >
                <Instagram />
              </IconButton>
              <IconButton
                size="small"
                href="mailto:Kapola@gmail.com"
                sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { color: '#ffdde1' } }}
              >
                <Email />
              </IconButton>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
              Comprar
            </Typography>
            <Stack spacing={1}>
              <Link href="/" color="inherit" underline="hover">Inicio</Link>
              <Link href="/ordenar" color="inherit" underline="hover">Ordenar</Link>
              <Link href="/cart" color="inherit" underline="hover">Carrito</Link>
              <Link href="/login" color="inherit" underline="hover">Mi cuenta</Link>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
              Informacion
            </Typography>
            <Stack spacing={1.4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <LocationOn sx={{ color: '#ffdde1', fontSize: 20 }} />
                <Typography variant="body2">Ciudadela Comfenalco, Ibague.</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Phone sx={{ color: '#ffdde1', fontSize: 20 }} />
                <Typography variant="body2">+57 323 944 5435</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <LocalShipping sx={{ color: '#ffdde1', fontSize: 20 }} />
                <Typography variant="body2">Domicilio y recogida segun disponibilidad.</Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
              Politicas
            </Typography>
            <Stack spacing={1.4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Policy sx={{ color: '#ffdde1', fontSize: 20 }} />
                <Typography variant="body2">Pedidos sujetos a disponibilidad de stock y horarios de produccion.</Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.78 }}>
                Revisa tu carrito antes de confirmar sabores, cantidades y datos de entrega.
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.16)' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} Kapola. Todos los derechos reservados.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>Hecho con</Typography>
            <Favorite sx={{ color: '#ffdde1', fontSize: 16 }} />
            <Typography variant="body2" sx={{ opacity: 0.8 }}>en Colombia</Typography>
          </Box>
        </Box>
      </Container>
    </Paper>
  );
};

export default Footer;
