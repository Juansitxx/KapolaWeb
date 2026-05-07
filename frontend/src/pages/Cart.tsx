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
  Stack,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  LocalShipping,
  Cookie,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CartItem, CartItemConfiguration, CartSelection } from '../types';

const API_BASE_NO_API = (process.env.REACT_APP_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

const Cart: React.FC = () => {
  const { cart, loading, updateCartItem, removeFromCart, clearCart, getTotal } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showCheckoutDialog, setShowCheckoutDialog] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role === 'admin') {
      navigate('/admin');
    }
  }, [isAuthenticated, user?.role, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const normalizeImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return '';
    return imageUrl.startsWith('http') ? imageUrl : `${API_BASE_NO_API}${imageUrl}`;
  };

  const parseConfiguration = (item: CartItem): CartItemConfiguration => {
    if (!item.configuration) return {};

    if (typeof item.configuration === 'string') {
      try {
        return JSON.parse(item.configuration);
      } catch {
        return { notes: item.configuration };
      }
    }

    return item.configuration;
  };

  const normalizeSelections = (value: unknown): CartSelection[] => {
    if (!Array.isArray(value)) return [];

    return value
      .map((selection) => {
        if (typeof selection === 'string') {
          return { name: selection };
        }

        if (!selection || typeof selection !== 'object') {
          return null;
        }

        const raw = selection as Record<string, any>;
        return {
          id: raw.id,
          optionId: raw.optionId,
          name: raw.name || raw.label || raw.flavor || raw.extra || 'Seleccion',
          quantity: Number(raw.quantity || 1),
          priceDelta: Number(raw.priceDelta || raw.additionalPrice || raw.extraPrice || 0),
          additionalPrice: Number(raw.additionalPrice || 0),
          extraPrice: Number(raw.extraPrice || 0),
        };
      })
      .filter(Boolean) as CartSelection[];
  };

  const getFlavors = (item: CartItem) => {
    const config = parseConfiguration(item);
    return normalizeSelections(config.flavors || config.selectedFlavors);
  };

  const getExtras = (item: CartItem) => {
    const config = parseConfiguration(item);
    return normalizeSelections(config.extras || config.selectedExtras);
  };

  const getSelectionPrice = (selection: CartSelection) => {
    return selection.priceDelta ?? selection.additionalPrice ?? selection.extraPrice ?? 0;
  };

  const getItemUnitPrice = (item: CartItem) => {
    return item.unitPrice ?? item.product.price;
  };

  const getItemSubtotal = (item: CartItem) => {
    return item.subtotal ?? getItemUnitPrice(item) * item.quantity;
  };

  const getItemSurcharge = (item: CartItem) => {
    const selections = [...getFlavors(item), ...getExtras(item)];
    return selections.reduce((total, selection) => {
      return total + getSelectionPrice(selection) * (selection.quantity || 1);
    }, 0);
  };

  const isConfigurableItem = (item: CartItem) => {
    return getFlavors(item).length > 0 || getExtras(item).length > 0 || Boolean(parseConfiguration(item).notes);
  };

  const handleQuantityChange = async (item: CartItem, newQuantity: number) => {
    setError(null);

    if (newQuantity <= 0) {
      setError('La cantidad debe ser mayor a 0. Usa eliminar si quieres quitar el producto.');
      return;
    }

    if (newQuantity > item.product.stock) {
      setError(`Stock insuficiente para ${item.product.name}. Disponible: ${item.product.stock}.`);
      return;
    }

    try {
      await updateCartItem(item.id, newQuantity);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'No se pudo actualizar la cantidad.');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setError(null);
    try {
      await removeFromCart(itemId);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'No se pudo eliminar el producto.');
    }
  };

  const handleClearCart = async () => {
    setError(null);
    try {
      await clearCart();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'No se pudo limpiar el carrito.');
    }
  };

  const handleCheckout = () => {
    setShowCheckoutDialog(true);
  };

  const handleConfirmCheckout = () => {
    navigate('/checkout');
  };

  if (!isAuthenticated || user?.role === 'admin') {
    return null;
  }

  if (loading && !cart) {
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
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            background: 'linear-gradient(135deg, #fff7f8 0%, #ffdde1 100%)',
          }}
        >
          <ShoppingCart sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Tu carrito esta vacio
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Agrega algunas galletas para comenzar tu pedido.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<ShoppingBag />}
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: '#ee9ca7',
              '&:hover': { backgroundColor: '#d4a5ad' },
            }}
          >
            Explorar productos
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 4 }}>
        <ShoppingCart sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Mi Carrito
        </Typography>
        <Chip
          label={`${cart.items.length} producto${cart.items.length !== 1 ? 's' : ''}`}
          color="primary"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {cart.items.map((item: CartItem) => {
            const flavors = getFlavors(item);
            const extras = getExtras(item);
            const configuration = parseConfiguration(item);
            const surcharge = getItemSurcharge(item);
            const unitPrice = getItemUnitPrice(item);
            const subtotal = getItemSubtotal(item);
            const isOutOfStock = item.product.stock <= 0;
            const isMaxQuantity = item.quantity >= item.product.stock;

            return (
              <Card
                key={item.id}
                sx={{
                  mb: 2,
                  border: '1px solid rgba(238, 156, 167, 0.2)',
                  boxShadow: '0 8px 22px rgba(74, 35, 41, 0.08)',
                }}
              >
                <CardContent>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={3}>
                      {normalizeImageUrl(item.product.imageUrl) ? (
                        <Box
                          component="img"
                          src={normalizeImageUrl(item.product.imageUrl)}
                          alt={item.product.name}
                          sx={{
                            width: '100%',
                            aspectRatio: '1 / 1',
                            objectFit: 'cover',
                            borderRadius: 2,
                            backgroundColor: '#fff7f8',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            aspectRatio: '1 / 1',
                            borderRadius: 2,
                            bgcolor: '#fff7f8',
                            color: '#b85c69',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Cookie sx={{ fontSize: 56 }} />
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1 }}>
                        {item.product.category && (
                          <Chip label={item.product.category} size="small" variant="outlined" />
                        )}
                        <Chip
                          label={isOutOfStock ? 'Agotado' : 'Disponible'}
                          size="small"
                          color={isOutOfStock ? 'error' : 'success'}
                        />
                        {isConfigurableItem(item) && (
                          <Chip label="Configurable" size="small" color="primary" />
                        )}
                      </Stack>

                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {item.product.name}
                      </Typography>

                      {item.product.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                          {item.product.description}
                        </Typography>
                      )}

                      {flavors.length > 0 && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                            Sabores seleccionados
                          </Typography>
                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            {flavors.map((flavor, index) => (
                              <Chip
                                key={`${flavor.name}-${index}`}
                                label={`${flavor.quantity && flavor.quantity > 1 ? `${flavor.quantity}x ` : ''}${flavor.name}${getSelectionPrice(flavor) > 0 ? ` +${formatPrice(getSelectionPrice(flavor))}` : ''}`}
                                size="small"
                                sx={{ bgcolor: '#fff7f8' }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {extras.length > 0 && (
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                            Extras
                          </Typography>
                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            {extras.map((extra, index) => (
                              <Chip
                                key={`${extra.name}-${index}`}
                                label={`${extra.quantity && extra.quantity > 1 ? `${extra.quantity}x ` : ''}${extra.name}${getSelectionPrice(extra) > 0 ? ` +${formatPrice(getSelectionPrice(extra))}` : ''}`}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {configuration.notes && (
                        <Alert severity="info" sx={{ mt: 1 }}>
                          {configuration.notes}
                        </Alert>
                      )}

                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Stock disponible: {item.product.stock}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                        <Typography variant="body2" color="text.secondary">
                          Precio base
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {formatPrice(item.product.price)}
                        </Typography>
                        {surcharge > 0 && (
                          <>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Recargos
                            </Typography>
                            <Typography variant="body1" color="warning.main" sx={{ fontWeight: 800 }}>
                              +{formatPrice(surcharge)}
                            </Typography>
                          </>
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Precio final unitario
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 900 }}>
                          {formatPrice(unitPrice)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: { xs: 'stretch', sm: 'center' },
                      gap: 2,
                      flexDirection: { xs: 'column', sm: 'row' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ mr: 1, fontWeight: 700 }}>
                        Cantidad
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        disabled={item.quantity <= 1 || loading}
                      >
                        <Remove />
                      </IconButton>
                      <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        disabled={isOutOfStock || isMaxQuantity || loading}
                      >
                        <Add />
                      </IconButton>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: { xs: 'space-between', sm: 'flex-end' },
                        gap: 2,
                      }}
                    >
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">
                          Total item
                        </Typography>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 900 }}>
                          {formatPrice(subtotal)}
                        </Typography>
                      </Box>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={loading}
                        aria-label={`Eliminar ${item.product.name}`}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}

          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearCart}
              disabled={loading}
            >
              Limpiar carrito
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Seguir comprando
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: { md: 'sticky' }, top: 20 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                Resumen del pedido
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal:</Typography>
                  <Typography>{formatPrice(getTotal())}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Envio:</Typography>
                  <Typography color="success.main">Por definir</Typography>
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
                  Revisa sabores, extras y cantidades antes de confirmar.
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
                  backgroundColor: '#ee9ca7',
                  '&:hover': { backgroundColor: '#d98291' },
                  py: 1.5,
                  fontWeight: 800,
                }}
              >
                Proceder al pago
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={showCheckoutDialog}
        onClose={() => setShowCheckoutDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar pedido</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Revisa que los productos, sabores, extras y cantidades sean correctos antes de continuar.
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
              backgroundColor: '#ee9ca7',
              '&:hover': { backgroundColor: '#d4a5ad' },
            }}
          >
            Confirmar pedido
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Cart;
