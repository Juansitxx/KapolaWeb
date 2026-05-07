import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Stack,
} from '@mui/material';
import {
  AddShoppingCart,
  Cookie,
  CardGiftcard,
  Inventory,
} from '@mui/icons-material';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
  showAddToCart?: boolean;
}

const API_BASE_NO_API = (process.env.REACT_APP_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showAddToCart = true,
}) => {
  const { addToCart, loading } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [imageFailed, setImageFailed] = React.useState(false);
  const canUseCart = isAuthenticated && user?.role === 'cliente';

  const imageUrl = product.imageUrl
    ? product.imageUrl.startsWith('http')
      ? product.imageUrl
      : `${API_BASE_NO_API}${product.imageUrl}`
    : '';

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesion para agregar productos al carrito');
      return;
    }

    if (!canUseCart) {
      alert('Solo los clientes pueden agregar productos al carrito');
      return;
    }

    try {
      await addToCart(product.id, 1);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('Error al agregar el producto al carrito');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const isOutOfStock = product.stock <= 0;
  const description = product.description || 'Galleta horneada artesanalmente, ideal para ordenar hoy.';
  const lowerName = product.name.toLowerCase();
  const productKind = lowerName.includes('caja')
    ? 'Caja'
    : lowerName.includes('combo')
      ? 'Combo'
      : product.category || 'Galleta';
  const placeholderIcon = lowerName.includes('caja')
    ? <Inventory sx={{ fontSize: 72, opacity: 0.85 }} />
    : lowerName.includes('combo')
      ? <CardGiftcard sx={{ fontSize: 72, opacity: 0.85 }} />
      : <Cookie sx={{ fontSize: 72, opacity: 0.85 }} />;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid rgba(238, 156, 167, 0.2)',
        boxShadow: '0 8px 22px rgba(74, 35, 41, 0.08)',
        transition: 'transform 160ms ease, box-shadow 160ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 12px 28px rgba(74, 35, 41, 0.14)',
        },
      }}
    >
      <Box sx={{ position: 'relative', aspectRatio: '4 / 3', bgcolor: '#fff7f8' }}>
        {imageUrl && !imageFailed ? (
          <CardMedia
            component="img"
            image={imageUrl}
            alt={product.name}
            onError={() => setImageFailed(true)}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #fff7f8 0%, #ffdde1 100%)',
              color: '#b85c69',
            }}
          >
            {placeholderIcon}
          </Box>
        )}

        <Chip
          label={isOutOfStock ? 'Agotado' : 'Disponible'}
          color={isOutOfStock ? 'error' : 'success'}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            fontWeight: 800,
            bgcolor: isOutOfStock ? undefined : '#2e7d32',
          }}
        />
        <Chip
          label={productKind}
          size="small"
          sx={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            fontWeight: 900,
            bgcolor: 'rgba(255,255,255,0.9)',
            color: '#7a3b45',
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.25 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }} useFlexGap flexWrap="wrap">
          {product.category && (
            <Chip
              label={product.category}
              size="small"
              variant="outlined"
              sx={{
                borderColor: '#ee9ca7',
                color: '#9d4f5d',
                fontWeight: 700,
              }}
            />
          )}
          {!isOutOfStock && product.stock <= 5 && (
            <Chip label="Quedan pocas" size="small" color="warning" />
          )}
        </Stack>

        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 800,
            color: '#332025',
            lineHeight: 1.18,
            minHeight: 44,
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            minHeight: 42,
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#b85c69' }}>
            {formatPrice(product.price)}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
            {isOutOfStock ? 'Sin stock' : `${product.stock} disponibles`}
          </Typography>
        </Box>
      </CardContent>

      {showAddToCart && (
        <CardActions sx={{ p: 2.25, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddShoppingCart />}
            onClick={handleAddToCart}
            disabled={isOutOfStock || loading || (isAuthenticated && !canUseCart)}
            sx={{
              backgroundColor: '#ee9ca7',
              py: 1.15,
              fontWeight: 800,
              '&:hover': { backgroundColor: '#d98291' },
              '&:disabled': {
                backgroundColor: '#e8d9dc',
                color: '#9e858b',
              },
            }}
          >
            {isOutOfStock
              ? 'Agotado'
              : loading
                ? 'Agregando...'
                : isAuthenticated && !canUseCart
                  ? 'Solo clientes'
                  : 'Agregar'}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default ProductCard;
