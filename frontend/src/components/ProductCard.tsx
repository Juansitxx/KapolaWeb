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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AddShoppingCart,
  Favorite,
  FavoriteBorder,
  Visibility,
} from '@mui/icons-material';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
  showAddToCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  showAddToCart = true,
}) => {
  const { addToCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = React.useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para agregar productos al carrito');
      return;
    }

    try {
      await addToCart(product.id, 1);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('Error al agregar el producto al carrito');
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(product);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(price);
  };

  const isOutOfStock = product.stock === 0;

  return (
    <Card
      sx={{
        maxWidth: 345,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        borderRadius: 3,
        overflow: 'hidden',
        margin: '8px',
        position: 'relative',
        zIndex: 1,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
          zIndex: 2,
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={product.imageUrl || '/placeholder-cookie.jpg'}
          alt={product.name}
          sx={{
            objectFit: 'cover',
            backgroundColor: '#f5f5f5',
          }}
          onError={(e: any) => {
            // Si falla la imagen, usar placeholder
            if (product.imageUrl) {
              console.error('Error al cargar imagen del producto:', product.imageUrl);
              e.target.src = '/placeholder-cookie.jpg';
            }
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 1,
          }}
        >
          <Tooltip title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
            <IconButton
              size="small"
              onClick={handleToggleFavorite}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              {isFavorite ? (
                <Favorite color="error" fontSize="small" />
              ) : (
                <FavoriteBorder fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver detalles">
            <IconButton
              size="small"
              onClick={handleViewDetails}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        {isOutOfStock && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Chip
              label="Agotado"
              color="error"
              variant="filled"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography
          gutterBottom
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 'bold',
            fontSize: '1.1rem',
            lineHeight: 1.2,
            mb: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </Typography>

        {product.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.description}
          </Typography>
        )}

        <Box sx={{ mb: 1 }}>
  <Typography
    variant="h6"
    color="primary"
    sx={{ fontWeight: 'bold' }}
  >
    {formatPrice(product.price)}
  </Typography>
  {product.category && (
    <Chip
      label={product.category}
      size="small"
      variant="outlined"
      color="primary"
      sx={{ mt: 0.5 }}
    />
  )}
</Box>


        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.875rem' }}
        >
          Stock: {product.stock} unidades
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddShoppingCart />}
          onClick={handleAddToCart}
          disabled={isOutOfStock || loading || !isAuthenticated}
          sx={{
            backgroundColor: '#ee9ca7',
            '&:hover': {
              backgroundColor: '#d4a5ad',
            },
            '&:disabled': {
              backgroundColor: '#e0e0e0',
              color: '#9e9e9e',
            },
          }}
        >
          {isOutOfStock
            ? 'Agotado'
            : !isAuthenticated
            ? 'Inicia sesión'
            : loading
            ? 'Agregando...'
            : 'Agregar al carrito'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
