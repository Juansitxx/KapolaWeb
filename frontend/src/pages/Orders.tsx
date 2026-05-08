import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ShoppingBag,
  Visibility,
  Cancel,
  LocalShipping,
  CheckCircle,
  Pending,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/api';
import { Order } from '../types';
import { useNavigate } from 'react-router-dom';

const Orders: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }
    loadOrders();
  }, [isAuthenticated, user?.role, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getOrders();
      setOrders(response.orders);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDialog(true);
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await orderService.cancelOrder(orderId);
      await loadOrders();
    } catch (err: any) {
      setError(err.message || 'Error al cancelar el pedido');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'warning';
      case 'confirmada':
        return 'info';
      case 'en_proceso':
        return 'primary';
      case 'enviada':
        return 'secondary';
      case 'entregada':
        return 'success';
      case 'cancelada':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Pending />;
      case 'confirmada':
        return <CheckCircle />;
      case 'en_proceso':
        return <Refresh />;
      case 'enviada':
        return <LocalShipping />;
      case 'entregada':
        return <CheckCircle />;
      case 'cancelada':
        return <Cancel />;
      default:
        return <Pending />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      en_proceso: 'En proceso',
      enviada: 'Enviada',
      entregada: 'Entregada',
      cancelada: 'Cancelada',
    };
    return statusMap[status] || status;
  };

  const getPaymentMethodText = (paymentMethod?: string) => {
    const paymentMethodMap: { [key: string]: string } = {
      contra_entrega: 'Contra entrega',
      transferencia: 'Transferencia',
      nequi_daviplata: 'Nequi / Daviplata',
    };
    return paymentMethod ? paymentMethodMap[paymentMethod] || paymentMethod : 'No especificado';
  };

  const getDeliveryMethodText = (deliveryMethod?: string) => {
    const deliveryMethodMap: { [key: string]: string } = {
      domicilio: 'Domicilio',
      recoger: 'Recoger',
    };
    return deliveryMethod ? deliveryMethodMap[deliveryMethod] || deliveryMethod : 'No especificada';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancelOrder = (status: string) => {
    return ['pendiente', 'confirmada'].includes(status);
  };

  if (!isAuthenticated || user?.role === 'admin') {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando pedidos...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadOrders}>
          Reintentar
        </Button>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
          }}
        >
          <ShoppingBag sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            No tienes pedidos aun
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Haz tu primer pedido y comienza a disfrutar de nuestras galletas.
          </Typography>
          <Button
            variant="contained"
            size="large"
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <ShoppingBag sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Mis pedidos
        </Typography>
        <Chip
          label={`${orders.length} pedido${orders.length !== 1 ? 's' : ''}`}
          color="primary"
          sx={{ ml: 2 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Entrega</TableCell>
              <TableCell>Pago</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    #{order.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(order.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getStatusIcon(order.status)}
                    label={getStatusText(order.status)}
                    color={getStatusColor(order.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {formatPrice(order.total || 0)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {getDeliveryMethodText(order.deliveryMethod)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.phone || 'Sin telefono'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {getPaymentMethodText(order.paymentMethod)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Ver detalles">
                      <IconButton
                        size="small"
                        onClick={() => handleViewOrder(order)}
                        color="primary"
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {canCancelOrder(order.status) && (
                      <Tooltip title="Cancelar pedido">
                        <IconButton
                          size="small"
                          onClick={() => handleCancelOrder(order.id)}
                          color="error"
                        >
                          <Cancel />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={showOrderDialog}
        onClose={() => setShowOrderDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalles del pedido #{selectedOrder?.id}
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha del pedido
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(selectedOrder.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estado
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedOrder.status)}
                    label={getStatusText(selectedOrder.status)}
                    color={getStatusColor(selectedOrder.status) as any}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatPrice(selectedOrder.total || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pago
                  </Typography>
                  <Typography variant="body1">
                    {getPaymentMethodText(selectedOrder.paymentMethod)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Entrega
                  </Typography>
                  <Typography variant="body1">
                    {getDeliveryMethodText(selectedOrder.deliveryMethod)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Telefono
                  </Typography>
                  <Typography variant="body1">
                    {selectedOrder.phone || 'No especificado'}
                  </Typography>
                </Grid>
                {selectedOrder.address && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Direccion
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.address}
                    </Typography>
                  </Grid>
                )}
                {selectedOrder.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Notas
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Productos
              </Typography>
              {selectedOrder.items.map((item) => (
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
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                            backgroundColor: '#f5f5f5',
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {item.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Cantidad: {item.quantity}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="h6" color="primary" sx={{ textAlign: 'right' }}>
                          {formatPrice(item.subtotal)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOrderDialog(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders;
