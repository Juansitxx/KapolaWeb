import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  AdminPanelSettings,
  ShoppingBag,
  Inventory,
  CheckCircle,
  ReceiptLong,
  People,
  Visibility,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { adminService, getApiErrorMessage } from '../services/api';
import { CartItemConfiguration, CartSelection, Order, OrderItem, Product, User } from '../types';

const API_BASE_NO_API = (process.env.REACT_APP_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

const ORDER_STATUSES = ['pendiente', 'confirmada', 'en_proceso', 'enviada', 'entregada', 'cancelada'];
const CATEGORIES = ['New York', 'Chocolate', 'Red Velvet', 'Clasicas', 'Especiales', 'Cajas'];

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
    category: '',
    active: true,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashboardResponse, productsResponse, ordersResponse, usersResponse] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getProducts({ limit: 100 }),
        adminService.getAllOrders({ limit: 50 }),
        adminService.getUsers({ limit: 100 }),
      ]);

      setDashboard(dashboardResponse);
      setProducts(productsResponse.products || []);
      setOrders(ordersResponse.orders || []);
      setUsers(usersResponse.users || []);
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Error al cargar panel admin'));
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    const response = await adminService.getProducts({ limit: 100 });
    setProducts(response.products || []);
  };

  const loadOrders = async () => {
    const response = await adminService.getAllOrders({ limit: 50 });
    setOrders(response.orders || []);
  };

  const loadUsers = async () => {
    const response = await adminService.getUsers({ limit: 100 });
    setUsers(response.users || []);
  };

  const formatPrice = (price?: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const normalizeImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return '';
    return imageUrl.startsWith('http') ? imageUrl : `${API_BASE_NO_API}${imageUrl}`;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      pendiente: 'warning',
      confirmada: 'info',
      en_proceso: 'primary',
      enviada: 'secondary',
      entregada: 'success',
      cancelada: 'error',
    };
    return colors[status] || 'default';
  };

  const getLowStockProducts = () => {
    return products.filter((product) => product.active && product.stock <= 10);
  };

  const getActiveProducts = () => products.filter((product) => product.active);

  const getPendingOrders = () => orders.filter((order) => ['pendiente', 'confirmada', 'en_proceso'].includes(order.status));

  const parseConfiguration = (value?: CartItemConfiguration | string | null): CartItemConfiguration => {
    if (!value) return {};
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return { notes: value };
      }
    }
    return value;
  };

  const normalizeSelections = (value: unknown): CartSelection[] => {
    if (!Array.isArray(value)) return [];
    return value
      .map((selection) => {
        if (typeof selection === 'string') return { name: selection };
        if (!selection || typeof selection !== 'object') return null;
        const raw = selection as Record<string, any>;
        return {
          name: raw.name || raw.label || raw.flavor || raw.extra || 'Seleccion',
          quantity: Number(raw.quantity || 1),
          priceDelta: Number(raw.priceDelta || raw.additionalPrice || raw.extraPrice || 0),
        };
      })
      .filter(Boolean) as CartSelection[];
  };

  const renderOrderItemConfig = (item: OrderItem) => {
    const config = parseConfiguration(item.configuration);
    const flavors = normalizeSelections(config.flavors || config.selectedFlavors);
    const extras = normalizeSelections(config.extras || config.selectedExtras);

    if (flavors.length === 0 && extras.length === 0 && !config.notes) {
      return <Typography variant="body2" color="text.secondary">Sin configuracion adicional</Typography>;
    }

    return (
      <Stack spacing={1} sx={{ mt: 1 }}>
        {flavors.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>Sabores</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
              {flavors.map((flavor, index) => (
                <Chip
                  key={`${flavor.name}-${index}`}
                  label={`${flavor.quantity && flavor.quantity > 1 ? `${flavor.quantity}x ` : ''}${flavor.name}${flavor.priceDelta ? ` +${formatPrice(flavor.priceDelta)}` : ''}`}
                  size="small"
                />
              ))}
            </Stack>
          </Box>
        )}
        {extras.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>Extras</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
              {extras.map((extra, index) => (
                <Chip
                  key={`${extra.name}-${index}`}
                  label={`${extra.quantity && extra.quantity > 1 ? `${extra.quantity}x ` : ''}${extra.name}${extra.priceDelta ? ` +${formatPrice(extra.priceDelta)}` : ''}`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        )}
        {config.notes && <Alert severity="info">{config.notes}</Alert>}
      </Stack>
    );
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        imageUrl: product.imageUrl || '',
        category: product.category || '',
        active: product.active,
      });
      setImagePreview(normalizeImageUrl(product.imageUrl) || null);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        imageUrl: '',
        category: '',
        active: true,
      });
      setImagePreview(null);
    }
    setSelectedFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setSelectedFile(null);
    setImagePreview(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      imageUrl: '',
      category: '',
      active: true,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen valido.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar 5MB.');
      return;
    }

    setSelectedFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      setSectionLoading(true);
      setError(null);
      setSuccess(null);

      const price = parseFloat(formData.price);
      const stock = parseInt(formData.stock, 10);

      if (!formData.name.trim()) {
        setError('El nombre del producto es obligatorio.');
        return;
      }

      if (!price || price <= 0) {
        setError('El precio debe ser mayor a 0.');
        return;
      }

      if (Number.isNaN(stock) || stock < 0) {
        setError('El stock debe ser mayor o igual a 0.');
        return;
      }

      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        stock,
        imageUrl: formData.imageUrl || undefined,
        category: formData.category || undefined,
        active: formData.active,
      };

      let productId: number;

      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, productData);
        productId = editingProduct.id;
        setSuccess('Producto actualizado.');
      } else {
        const response = await adminService.createProduct(productData);
        productId = response.product.id;
        setSuccess('Producto creado.');
      }

      if (selectedFile) {
        await adminService.uploadProductImage(productId, selectedFile);
        setSuccess(editingProduct ? 'Producto e imagen actualizados.' : 'Producto e imagen creados.');
      }

      handleCloseDialog();
      await loadProducts();
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Error al guardar producto'));
    } finally {
      setSectionLoading(false);
    }
  };

  const handleDelete = async (productId: number) => {
    try {
      setSectionLoading(true);
      setError(null);
      setSuccess(null);
      const response = await adminService.deleteProduct(productId);
      setSuccess(response.message || 'Producto desactivado.');
      setDeleteConfirm(null);
      await loadProducts();
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Error al desactivar producto'));
    } finally {
      setSectionLoading(false);
    }
  };

  const handleOrderStatusChange = async (orderId: number, status: string) => {
    try {
      setSectionLoading(true);
      setError(null);
      setSuccess(null);
      const response = await adminService.updateOrderStatusAdmin(orderId, status);
      setSuccess('Estado de pedido actualizado.');
      setOrders((prev) => prev.map((order) => order.id === orderId ? response.order : order));
      setSelectedOrder((prev) => prev && prev.id === orderId ? response.order : prev);
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Error al actualizar estado del pedido'));
    } finally {
      setSectionLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Alert severity="warning">
          No tienes permisos para acceder al panel de administracion.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Cargando panel de administracion...
        </Typography>
      </Container>
    );
  }

  const dashboardOverview = dashboard?.overview || {};
  const lowStockProducts = getLowStockProducts();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AdminPanelSettings sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 900 }}>
                Panel Admin Kapola
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gestiona productos, stock, imagenes, pedidos y clientes.
              </Typography>
            </Box>
          </Box>
          <Button startIcon={<Refresh />} variant="outlined" onClick={loadAdminData} disabled={sectionLoading}>
            Actualizar
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <ShoppingBag color="primary" />
              <Typography variant="body2" color="text.secondary">Productos activos</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>{dashboardOverview.totalProducts ?? getActiveProducts().length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <ReceiptLong color="primary" />
              <Typography variant="body2" color="text.secondary">Pedidos totales</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>{dashboardOverview.totalOrders ?? orders.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Inventory color="warning" />
              <Typography variant="body2" color="text.secondary">Stock bajo</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>{lowStockProducts.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <CheckCircle color="success" />
              <Typography variant="body2" color="text.secondary">Ventas entregadas</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>{formatPrice(dashboardOverview.totalRevenue)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {lowStockProducts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Productos con bajo stock</Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
            {lowStockProducts.map((product) => (
              <Chip key={product.id} label={`${product.name}: ${product.stock}`} size="small" color="warning" />
            ))}
          </Stack>
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<ShoppingBag />} iconPosition="start" label="Productos" />
          <Tab icon={<ReceiptLong />} iconPosition="start" label={`Pedidos (${getPendingOrders().length})`} />
          <Tab icon={<People />} iconPosition="start" label="Clientes" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>Productos</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{ backgroundColor: '#ee9ca7', '&:hover': { backgroundColor: '#d98291' } }}
            >
              Crear producto
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Imagen</TableCell>
                  <TableCell>Producto</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      {normalizeImageUrl(product.imageUrl) ? (
                        <CardMedia
                          component="img"
                          image={normalizeImageUrl(product.imageUrl)}
                          alt={product.name}
                          sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1, bgcolor: '#f5f5f5' }}
                        />
                      ) : (
                        <Box sx={{ width: 60, height: 60, borderRadius: 1, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShoppingBag color="disabled" />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 800 }}>{product.name}</Typography>
                      {product.description && (
                        <Typography variant="caption" color="text.secondary">{product.description.slice(0, 72)}{product.description.length > 72 ? '...' : ''}</Typography>
                      )}
                    </TableCell>
                    <TableCell>{product.category ? <Chip label={product.category} size="small" /> : 'Sin categoria'}</TableCell>
                    <TableCell align="right">{formatPrice(product.price)}</TableCell>
                    <TableCell align="right">
                      <Chip label={product.stock} color={product.stock <= 10 ? 'warning' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={product.active ? 'Activo' : 'Inactivo'} color={product.active ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleOpenDialog(product)} color="primary" size="small">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => setDeleteConfirm(product.id)} color="error" size="small" disabled={!product.active}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>Pedidos</Typography>
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadOrders}>Actualizar pedidos</Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>No hay pedidos registrados</TableCell>
                  </TableRow>
                ) : orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{order.user?.name || 'Cliente'}</Typography>
                      <Typography variant="caption" color="text.secondary">{order.user?.email || 'Sin email'}</Typography>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                          disabled={sectionLoading}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => {
                          setSelectedOrder(order);
                          setOrderDialogOpen(true);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>Clientes y usuarios</Typography>
            <Button variant="outlined" startIcon={<Refresh />} onClick={loadUsers}>Actualizar usuarios</Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Pedidos</TableCell>
                  <TableCell>Creado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((appUser: any) => (
                  <TableRow key={appUser.id} hover>
                    <TableCell>{appUser.name}</TableCell>
                    <TableCell>{appUser.email}</TableCell>
                    <TableCell><Chip label={appUser.role} size="small" color={appUser.role === 'admin' ? 'warning' : 'default'} /></TableCell>
                    <TableCell>{appUser._count?.orders ?? 0}</TableCell>
                    <TableCell>{formatDate(appUser.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingProduct ? 'Editar producto' : 'Crear producto'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <TextField label="Nombre del producto" fullWidth required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <TextField label="Descripcion" fullWidth multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Precio (COP)" type="number" fullWidth required inputProps={{ min: 0 }} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Stock" type="number" fullWidth required inputProps={{ min: 0 }} value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
              </Grid>
            </Grid>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select value={formData.category} label="Categoria" onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                <MenuItem value="">Sin categoria</MenuItem>
                {CATEGORIES.map((category) => <MenuItem key={category} value={category}>{category}</MenuItem>)}
              </Select>
            </FormControl>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Imagen del producto</Typography>
              <input accept="image/*" style={{ display: 'none' }} id="admin-image-upload" type="file" onChange={handleFileChange} />
              <label htmlFor="admin-image-upload">
                <Button variant="outlined" component="span">Subir imagen</Button>
              </label>
              {selectedFile && <Typography variant="caption" sx={{ ml: 2 }}>{selectedFile.name}</Typography>}
              {imagePreview && (
                <Box component="img" src={imagePreview} alt="Preview" sx={{ display: 'block', maxWidth: 240, maxHeight: 180, objectFit: 'contain', mt: 2, borderRadius: 1 }} />
              )}
              <TextField
                label="URL de imagen"
                fullWidth
                sx={{ mt: 2 }}
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                disabled={Boolean(selectedFile)}
              />
            </Box>
            <FormControlLabel control={<Switch checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />} label="Producto activo" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={sectionLoading || !formData.name || !formData.price}>
            {editingProduct ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Desactivar producto</DialogTitle>
        <DialogContent>
          <Typography>El producto dejara de mostrarse en el catalogo publico. Puedes reactivarlo editandolo.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} variant="contained" color="error" disabled={sectionLoading}>
            Desactivar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={orderDialogOpen} onClose={() => setOrderDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalle del pedido #{selectedOrder?.id}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Cliente</Typography>
                  <Typography>{selectedOrder.user?.name || 'Cliente'}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedOrder.user?.email || 'Sin email'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Estado</Typography>
                  <Chip label={selectedOrder.status} color={getStatusColor(selectedOrder.status)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Fecha</Typography>
                  <Typography>{formatDate(selectedOrder.createdAt)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Total</Typography>
                  <Typography sx={{ fontWeight: 900 }}>{formatPrice(selectedOrder.total)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Datos de entrega</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Metodo de pago: {selectedOrder.paymentMethod || 'No especificado'}. Entrega/recogida y direccion se mostraran aqui cuando el checkout los envie.
                  </Typography>
                </Grid>
              </Grid>
              <Divider />
              <Typography variant="h6" sx={{ fontWeight: 900 }}>Productos del pedido</Typography>
              {selectedOrder.items.map((item) => (
                <Paper key={item.id} variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Typography sx={{ fontWeight: 800 }}>{item.product?.name || item.productSnapshot?.name || 'Producto'}</Typography>
                      <Typography variant="body2" color="text.secondary">Cantidad: {item.quantity}</Typography>
                      {renderOrderItemConfig(item)}
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: { sm: 'right' } }}>Subtotal</Typography>
                      <Typography sx={{ fontWeight: 900, textAlign: { sm: 'right' } }}>{formatPrice(item.subtotal)}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {selectedOrder && (
            <FormControl size="small" sx={{ minWidth: 180, mr: 'auto' }}>
              <Select value={selectedOrder.status} onChange={(e) => handleOrderStatusChange(selectedOrder.id, e.target.value)}>
                {ORDER_STATUSES.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
              </Select>
            </FormControl>
          )}
          <Button onClick={() => setOrderDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Admin;
