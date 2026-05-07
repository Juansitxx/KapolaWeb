import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Container,
} from '@mui/material';
import {
  ShoppingCart,
  Menu as MenuIcon,
  Person,
  Login,
  Logout,
  Home,
  AdminPanelSettings,
  ShoppingBag,
  LocationOn,
  AccountCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { getItemCount } = useCart();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isCliente = user?.role === 'cliente';
  const isAdmin = user?.role === 'admin';

  const closeProfileMenu = () => setAnchorEl(null);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const goTo = (path: string) => {
    navigate(path);
    closeMobileMenu();
    closeProfileMenu();
  };

  const handleLogout = () => {
    logout();
    closeProfileMenu();
    closeMobileMenu();
    navigate('/');
  };

  const menuItems = [
    { label: 'Inicio', path: '/', icon: <Home /> },
    { label: 'Ordenar', path: '/ordenar', icon: <ShoppingBag /> },
    { label: 'Ubicacion', path: '/#ubicacion', icon: <LocationOn /> },
  ];

  if (isAdmin) {
    menuItems.push({ label: 'Panel Admin', path: '/admin', icon: <AdminPanelSettings /> });
  }

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 247, 248, 0.94)',
          color: '#3f1f25',
          borderBottom: '1px solid rgba(238, 156, 167, 0.22)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 72, gap: 2 }}>
            <Typography
              variant="h5"
              component="button"
              onClick={() => goTo('/')}
              sx={{
                border: 0,
                bgcolor: 'transparent',
                cursor: 'pointer',
                fontWeight: 950,
                color: '#b85c69',
                letterSpacing: 0,
                mr: { xs: 'auto', md: 2 },
              }}
            >
              Kapola
            </Typography>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  startIcon={item.icon}
                  onClick={() => goTo(item.path)}
                  sx={{
                    color: '#4a2329',
                    fontWeight: 800,
                    px: 1.5,
                    '&:hover': { bgcolor: '#fff0f2' },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Button
              variant="contained"
              onClick={() => goTo('/ordenar')}
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                bgcolor: '#ee9ca7',
                color: 'white',
                fontWeight: 900,
                px: 2.5,
                '&:hover': { bgcolor: '#d98291' },
              }}
            >
              Ordenar ahora
            </Button>

            {(!isAuthenticated || isCliente) && (
              <IconButton onClick={() => goTo('/cart')} sx={{ color: '#4a2329' }}>
                <Badge badgeContent={getItemCount()} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>
            )}

            {isAuthenticated ? (
              <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: '#ee9ca7', color: '#fff', fontWeight: 900 }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            ) : (
              <Button
                startIcon={<Login />}
                onClick={() => goTo('/login')}
                sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: '#4a2329', fontWeight: 800 }}
              >
                Mi cuenta
              </Button>
            )}

            <IconButton
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ display: { xs: 'inline-flex', md: 'none' }, color: '#4a2329' }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeProfileMenu}>
        <MenuItem onClick={() => goTo('/profile')}>
          <ListItemIcon><Person fontSize="small" /></ListItemIcon>
          <ListItemText>Mi cuenta</ListItemText>
        </MenuItem>
        {isCliente && (
          <MenuItem onClick={() => goTo('/orders')}>
            <ListItemIcon><ShoppingBag fontSize="small" /></ListItemIcon>
            <ListItemText>Mis pedidos</ListItemText>
          </MenuItem>
        )}
        {isAdmin && (
          <MenuItem onClick={() => goTo('/admin')}>
            <ListItemIcon><AdminPanelSettings fontSize="small" /></ListItemIcon>
            <ListItemText>Panel Admin</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
          <ListItemText>Cerrar sesion</ListItemText>
        </MenuItem>
      </Menu>

      <Drawer anchor="right" open={mobileMenuOpen} onClose={closeMobileMenu}>
        <Box sx={{ width: 280, pt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.path} component="button" onClick={() => goTo(item.path)} sx={{ cursor: 'pointer' }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            {isAuthenticated ? (
              <>
                <ListItem component="button" onClick={() => goTo('/profile')} sx={{ cursor: 'pointer' }}>
                  <ListItemIcon><AccountCircle /></ListItemIcon>
                  <ListItemText primary="Mi cuenta" />
                </ListItem>
                {isCliente && (
                  <ListItem component="button" onClick={() => goTo('/orders')} sx={{ cursor: 'pointer' }}>
                    <ListItemIcon><ShoppingBag /></ListItemIcon>
                    <ListItemText primary="Mis pedidos" />
                  </ListItem>
                )}
                <ListItem component="button" onClick={handleLogout} sx={{ cursor: 'pointer' }}>
                  <ListItemIcon><Logout /></ListItemIcon>
                  <ListItemText primary="Cerrar sesion" />
                </ListItem>
              </>
            ) : (
              <ListItem component="button" onClick={() => goTo('/login')} sx={{ cursor: 'pointer' }}>
                <ListItemIcon><Login /></ListItemIcon>
                <ListItemText primary="Mi cuenta" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
