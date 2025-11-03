import React, { useState, useEffect } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  Typography,
  Popper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fade,
  Chip,
} from '@mui/material';
import {
  Search,
  Clear,
  History,
  TrendingUp,
} from '@mui/icons-material';
import { productService } from '../services/api';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Buscar galletas...',
  fullWidth = false,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ type: string; value: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (query.length >= 2) {
      loadSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const loadSuggestions = async () => {
    try {
      const response = await productService.getSearchSuggestions(query);
      setSuggestions(response.suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: { type: string; value: string }) => {
    setQuery(suggestion.value);
    handleSearch(suggestion.value);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Search />;
      case 'category':
        return <TrendingUp />;
      default:
        return <History />;
    }
  };

  return (
    <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <Paper
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: fullWidth ? '100%' : 400,
          maxWidth: '100%',
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          transition: 'box-shadow 0.2s ease-in-out',
        }}
        ref={(el) => setAnchorEl(el)}
      >
        <IconButton
          type="submit"
          sx={{
            p: '10px',
            color: '#ee9ca7',
            '&:hover': {
              backgroundColor: 'rgba(238, 156, 167, 0.1)',
            },
          }}
        >
          <Search />
        </IconButton>
        <InputBase
          sx={{
            ml: 1,
            flex: 1,
            fontSize: '1rem',
            '& input': {
              '&::placeholder': {
                opacity: 0.7,
              },
            },
          }}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        {query && (
          <IconButton
            onClick={handleClear}
            sx={{
              p: '10px',
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <Clear />
          </IconButton>
        )}
      </Paper>

      {/* Sugerencias */}
      <Popper
        open={showSuggestions && suggestions.length > 0}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{
          width: anchorEl?.offsetWidth || 'auto',
          zIndex: 1300,
        }}
        transition
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              sx={{
                mt: 1,
                maxHeight: 300,
                overflow: 'auto',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: 2,
              }}
            >
              <List dense>
                {suggestions.slice(0, 8).map((suggestion, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(238, 156, 167, 0.1)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {getSuggestionIcon(suggestion.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={suggestion.value}
                      secondary={suggestion.type === 'product' ? 'Producto' : 'Categoría'}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
};

export default SearchBar;
