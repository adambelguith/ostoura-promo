import React, { useState } from 'react';
import { Box, Autocomplete, TextField, Chip, Typography } from '@mui/material';

const colors = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Teal', hex: '#008080' },
];

const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '30', '32', '34', '36', '38'];

const VariantsStep = ({ selectedVariants, setSelectedVariants }) => {
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  // Handle color selection
  const handleColorChange = (event, newColors) => {
    setSelectedColors(newColors);
    setSelectedVariants({ ...selectedVariants, colors: newColors });
  };

  // Handle size selection
  const handleSizeChange = (event, newSizes) => {
    setSelectedSizes(newSizes);
    setSelectedVariants({ ...selectedVariants, sizes: newSizes });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">Category Metafields</Typography>

      {/* Color Selection */}
      <Autocomplete
        multiple
        options={colors}
        getOptionLabel={(option) => option.name}
        value={selectedColors}
        onChange={handleColorChange}
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: option.hex,
                border: '1px solid #e0e0e0',
              }}
            />
            {option.name}
          </Box>
        )}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              key={option.name}
              label={option.name}
              {...getTagProps({ index })}
              avatar={
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: option.hex,
                  }}
                />
              }
            />
          ))
        }
        renderInput={(params) => <TextField {...params} label="Color" variant="outlined" />}
      />

      {/* Size Selection */}
      <Autocomplete
        multiple
        options={sizes}
        value={selectedSizes}
        onChange={handleSizeChange}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip key={option} label={option} {...getTagProps({ index })} />
          ))
        }
        renderInput={(params) => <TextField {...params} label="Size" variant="outlined" />}
      />
    </Box>
  );
};

export default VariantsStep;
