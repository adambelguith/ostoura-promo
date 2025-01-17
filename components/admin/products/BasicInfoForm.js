import { TextField, Autocomplete, Chip } from '@mui/material';
import { Controller } from 'react-hook-form';

export default function BasicInfoForm({ register, errors, control, productData, setProductData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <TextField
        label="Product Name"
        fullWidth
        {...register('name', { required: 'Name is required' })}
        error={!!errors.name}
        helperText={errors.name?.message}
      />

      <TextField
        label="Slug"
        fullWidth
        {...register('slug', { required: 'Slug is required' })}
        error={!!errors.slug}
        helperText={errors.slug?.message}
      />

      <TextField
        label="Price"
        type="number"
        fullWidth
        {...register('price', { required: 'Price is required' })}
        error={!!errors.price}
        helperText={errors.price?.message}
      />

      <TextField
        label="Stock"
        type="number"
        fullWidth
        {...register('countInStock', { required: 'Stock is required' })}
        error={!!errors.countInStock}
        helperText={errors.countInStock?.message}
      />

      <Controller
        name="category"
        control={control}
        rules={{ required: 'Category is required' }}
        render={({ field }) => (
          <Autocomplete
            {...field}
            options={productData.categories || []}
            getOptionLabel={(option) => option.name}
            onChange={(_, value) => {
              field.onChange(value);
              setProductData(prev => ({
                ...prev,
                category: value,
                subcategory: null
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                error={!!errors.category}
                helperText={errors.category?.message}
              />
            )}
          />
        )}
      />

      <TextField
        label="Brand"
        fullWidth
        {...register('brand', { required: 'Brand is required' })}
        error={!!errors.brand}
        helperText={errors.brand?.message}
      />

      <div className="md:col-span-2">
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={4}
          {...register('description', { required: 'Description is required' })}
          error={!!errors.description}
          helperText={errors.description?.message}
        />
      </div>

      <div className="md:col-span-2">
        <Controller
          name="tags"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              multiple
              freeSolo
              options={[]}
              value={productData.tags}
              onChange={(_, newValue) => {
                field.onChange(newValue);
                setProductData(prev => ({
                  ...prev,
                  tags: newValue
                }));
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Add tags"
                />
              )}
            />
          )}
        />
      </div>
    </div>
  );
} 