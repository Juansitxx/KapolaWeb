import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando...',
  size = 60,
  fullScreen = false,
}) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          zIndex: 9999,
        }),
        ...(!fullScreen && { py: 4 }),
      }}
    >
      <Fade in={true} timeout={500}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress
            size={size}
            sx={{
              color: '#8B4513',
              mb: 2,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
            }}
          >
            {message}
          </Typography>
        </Box>
      </Fade>
    </Box>
  );

  return content;
};

export default LoadingSpinner;
