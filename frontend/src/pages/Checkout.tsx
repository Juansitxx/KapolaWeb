import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  CheckCircle,
  LocalShipping,
  Payment,
  Storefront,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getApiErrorMessage, orderService } from '../services/api';
import { CartItem } from '../types';

type DeliveryMethod = 'domicilio' | 'recoger';
type PaymentMethod = 'contra_entrega' | 'transferencia' | 'nequi_daviplata';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { cart, loading, clearCart, getTotal } = useCart();
  const [deliveryMethod, setDeliveryMethod] = React.useState<DeliveryMethod>('domicilio');
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('contra_entrega');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        replace: true,
        state: {
          from: '/checkout',
          message: 'Inicia sesion para confirmar tu pedido.',
        },
      });
      return;
    }

    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user?.role, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getItemSubtotal = (item: CartItem) => {
    return item.subtotal ?? ((item.unitPrice ?? item.product.price) * item.quantity);
  };

  const validateForm = () => {
    if (!cart?.items?.length) {
      return 'Tu carrito esta vacio.';
    }

    if (!phone.trim()) {
      return 'El telefono es obligatorio.';
    }

    if (deliveryMethod === 'domicilio' && !address.trim()) {
      return 'La direccion es obligatoria para pedidos a domicilio.';
    }

    const invalidItem = cart.items.find((item) => item.quantity <= 0 || item.quantity > item.product.stock);
    if (invalidItem) {
      return `Revisa la cantidad de ${invalidItem.product.name}. Stock disponible: ${invalidItem.product.stock}.`;
    }

    return null;
  };

  const handleConfirmOrder = async () => {
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      const items = cart!.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      await orderService.createOrder({
        items,
        paymentMethod,
        deliveryMethod,
        customerName: user?.name,
        phone: phone.trim(),
        address: deliveryMethod === 'domicilio' ? address.trim() : undefined,
        notes: notes.trim() || undefined,
      });
      await clearCart();
      setSuccess('Pedido creado correctamente. Puedes verlo en Mis Pedidos.');

      setTimeout(() => {
        navigate('/orders');
      }, 1200);
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'No se pudo crear el pedido.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || user?.role === 'admin') {
    return null;
  }

  if (loading && !cart) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Cargando checkout...</Typography>
      </Container>
    );
  }

  if (!cart?.items?.length) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
          <Storefront sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
            Tu carrito esta vacio
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Agrega productos antes de confirmar un pedido.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/ordenar')}>
            Ordenar ahora
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" sx={{ color: '#b85c69', fontWeight: 900 }}>
          Checkout
        </Typography>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
          Confirma tu pedido
        </Typography>
        <Typography color="text.secondary">
          Revisa tu carrito y completa los datos minimos para que Kapola organice el pedido.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert icon={<CheckCircle />} severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: { xs: 2.5, md: 3 }, mb: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <LocalShipping color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Entrega
              </Typography>
            </Stack>

            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel>Como quieres recibir tu pedido?</FormLabel>
              <RadioGroup
                row
                value={deliveryMethod}
                onChange={(event) => setDeliveryMethod(event.target.value as DeliveryMethod)}
              >
                <FormControlLabel value="domicilio" control={<Radio />} label="Domicilio" />
                <FormControlLabel value="recoger" control={<Radio />} label="Recoger" />
              </RadioGroup>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre"
                  value={user?.name || ''}
                  fullWidth
                  disabled
                  helperText="Usamos el nombre de tu cuenta"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Telefono"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              {deliveryMethod === 'domicilio' && (
                <Grid item xs={12}>
                  <TextField
                    label="Direccion de entrega"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    required
                    fullWidth
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  label="Notas opcionales"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Ej: horario preferido, referencia, instrucciones de entrega"
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Payment color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Pago manual
              </Typography>
            </Stack>

            <FormControl component="fieldset">
              <FormLabel>Metodo de pago</FormLabel>
              <RadioGroup
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
              >
                <FormControlLabel value="contra_entrega" control={<Radio />} label="Contra entrega" />
                <FormControlLabel value="transferencia" control={<Radio />} label="Transferencia" />
                <FormControlLabel value="nequi_daviplata" control={<Radio />} label="Nequi / Daviplata" />
              </RadioGroup>
            </FormControl>

            <Alert severity="info" sx={{ mt: 2 }}>
              Este checkout no procesa pagos en linea. Kapola confirma el pedido y coordina el pago manualmente.
            </Alert>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ position: { md: 'sticky' }, top: 20 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                Resumen del pedido
              </Typography>

              <Stack spacing={2}>
                {cart.items.map((item) => (
                  <Box key={item.id}>
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Box>
                        <Typography sx={{ fontWeight: 800 }}>{item.product.name}</Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                          {item.product.category && <Chip label={item.product.category} size="small" variant="outlined" />}
                          <Chip label={`x${item.quantity}`} size="small" />
                        </Stack>
                      </Box>
                      <Typography sx={{ fontWeight: 900 }}>
                        {formatPrice(getItemSubtotal(item))}
                      </Typography>
                    </Stack>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))}
              </Stack>

              <Stack spacing={1.5} sx={{ mt: 3 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Subtotal</Typography>
                  <Typography>{formatPrice(getTotal())}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>Entrega</Typography>
                  <Typography color="text.secondary">Por confirmar</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>Total</Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 900 }}>
                    {formatPrice(getTotal())}
                  </Typography>
                </Stack>
              </Stack>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleConfirmOrder}
                disabled={submitting || loading}
                sx={{ mt: 3, py: 1.4, fontWeight: 900, bgcolor: '#ee9ca7', '&:hover': { bgcolor: '#d98291' } }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Confirmar pedido'}
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => navigate('/cart')}
                disabled={submitting}
                sx={{ mt: 1 }}
              >
                Volver al carrito
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
