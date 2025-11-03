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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import SearchBar from './SearchBar';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { getItemCount } = useCart();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate('/');
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const menuItems = [
    { label: 'Inicio', path: '/', icon: <Home /> },
    { label: 'Productos', path: '/products', icon: <ShoppingBag /> },
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      label: 'Administración',
      path: '/admin',
      icon: <AdminPanelSettings />,
    });
  }

  return (
    <>
      <AppBar 
        position="sticky" 
        sx={{ 
          background: 'linear-gradient(to right, #ffdde1, #ee9ca7)',
          borderRadius: 0,
          boxShadow: 'none',
          borderBottom: '1px solid rgba(238, 156, 167, 0.2)'
        }}
      >
        <Toolbar sx={{ borderRadius: 0 }}>
          {/* Logo y título */}
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 0,
              mr: 4,
              fontWeight: 'bold',
              cursor: 'pointer',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
              color: '#ffffff'
            }}
            onClick={() => navigate('/')}
          >
             Kapola
          </Typography>

          {/* Búsqueda */}
          <Box sx={{ flexGrow: 1, maxWidth: 400, mx: 2 }}>
            <SearchBar onSearch={handleSearch} fullWidth />
          </Box>

          {/* Espaciador para empujar elementos a la derecha */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Elementos del lado derecho */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Navegación desktop */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{ 
                    textTransform: 'none',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
            {/* Carrito */}
            <IconButton
              color="inherit"
              onClick={() => navigate('/cart')}
              sx={{
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              <Badge badgeContent={getItemCount()} color="error">
                <ShoppingCart sx={{ color: '#ffffff' }} />
              </Badge>
            </IconButton>

            {/* Menú de usuario */}
            {isAuthenticated ? (
              <IconButton
                size="large"
                edge="end"
                aria-label="cuenta de usuario"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255, 255, 255, 0.2)' }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            ) : (
              <Button
                color="inherit"
                startIcon={<Login />}
                onClick={() => navigate('/login')}
                sx={{ 
                  textTransform: 'none',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)'
                  }
                }}
              >
                Iniciar Sesión
              </Button>
            )}
          </Box>

          {/* Menú móvil */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menú"
            onClick={() => setMobileMenuOpen(true)}
            sx={{ 
              display: { xs: 'block', md: 'none' }, 
              ml: 1,
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            <MenuIcon sx={{ color: '#ffffff' }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Menú de perfil */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mi Perfil</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigate('/orders'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <ShoppingBag fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mis Pedidos</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Cerrar Sesión</ListItemText>
        </MenuItem>
      </Menu>

      {/* Drawer móvil */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem
                key={item.path}
                component="button"
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            {isAuthenticated ? (
              <>
                <ListItem
                  component="button"
                  onClick={() => {
                    navigate('/profile');
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText primary="Mi Perfil" />
                </ListItem>
                <ListItem
                  component="button"
                  onClick={() => {
                    navigate('/orders');
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon>
                    <ShoppingBag />
                  </ListItemIcon>
                  <ListItemText primary="Mis Pedidos" />
                </ListItem>
                <ListItem 
                  component="button" 
                  onClick={handleLogout}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemIcon>
                    <Logout />
                  </ListItemIcon>
                  <ListItemText primary="Cerrar Sesión" />
                </ListItem>
              </>
            ) : (
              <ListItem
                component="button"
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon>
                  <Login />
                </ListItemIcon>
                <ListItemText primary="Iniciar Sesión" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
