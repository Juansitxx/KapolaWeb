import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Divider,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  LocalShipping,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';

const Cart: React.FC = () => {
  const { cart, loading, updateCartItem, removeFromCart, clearCart, getTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showCheckoutDialog, setShowCheckoutDialog] = React.useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateCartItem(itemId, newQuantity);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    await removeFromCart(itemId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  const handleCheckout = () => {
    setShowCheckoutDialog(true);
  };

  const handleConfirmCheckout = () => {
    // Aquí iría la lógica para procesar el pedido
    navigate('/checkout');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  if (!isAuthenticated) {
    return null; // Se redirige automáticamente
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando carrito...
        </Typography>
      </Container>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
          }}
        >
          <ShoppingCart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Tu carrito está vacío
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            ¡Agrega algunas deliciosas galletas para comenzar!
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<ShoppingBag />}
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: '#8B4513',
              '&:hover': { backgroundColor: '#A0522D' },
            }}
          >
            Explorar Productos
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <ShoppingCart sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Mi Carrito
        </Typography>
        <Chip
          label={`${cart.items.length} producto${cart.items.length !== 1 ? 's' : ''}`}
          color="primary"
          sx={{ ml: 2 }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Lista de productos */}
        <Grid item xs={12} md={8}>
          {cart.items.map((item: CartItem) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <Box
                      component="img"
                      src={item.product.imageUrl || '/placeholder-cookie.jpg'}
                      alt={item.product.name}
                      sx={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 1,
                        backgroundColor: '#f5f5f5',
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {item.product.name}
                    </Typography>
                    {item.product.category && (
                      <Chip
                        label={item.product.category}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Stock: {item.product.stock} unidades
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        {formatPrice(item.product.price)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        por unidad
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                      Cantidad:
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Remove />
                    </IconButton>
                    <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Add />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      {formatPrice(item.product.price * item.quantity)}
                    </Typography>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearCart}
              disabled={loading}
            >
              Limpiar Carrito
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Seguir Comprando
            </Button>
          </Box>
        </Grid>

        {/* Resumen del pedido */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Resumen del Pedido
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>{formatPrice(getTotal())}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Envío:</Typography>
                  <Typography color="success.main">Gratis</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Total:
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    {formatPrice(getTotal())}
                  </Typography>
                </Box>
              </Box>

              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <LocalShipping sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  Envío gratis en pedidos mayores a €50
                </Typography>
              </Alert>

              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<CreditCard />}
                onClick={handleCheckout}
                disabled={loading || cart.items.length === 0}
                sx={{
                  backgroundColor: '#8B4513',
                  '&:hover': { backgroundColor: '#A0522D' },
                  py: 1.5,
                }}
              >
                Proceder al Pago
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de confirmación de checkout */}
      <Dialog
        open={showCheckoutDialog}
        onClose={() => setShowCheckoutDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar Pedido</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Estás seguro de que quieres proceder con este pedido?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total: {formatPrice(getTotal())}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCheckoutDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmCheckout}
            variant="contained"
            sx={{
              backgroundColor: '#8B4513',
              '&:hover': { backgroundColor: '#A0522D' },
            }}
          >
            Confirmar Pedido
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Cart;
