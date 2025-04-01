import { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Grid,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  AddPhotoAlternate,
  Delete,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Image from 'next/image';
import { toast } from 'react-toastify';

export default function MediaUpload({ productId, productData, setProductData, onImagesChange }) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch existing images when the component mounts
  useEffect(() => {
    fetchExistingImages();
  }, [productId, onImagesChange]); // Only fetch on mount or when the productId changes

  const fetchExistingImages = async () => {
    try {
      const { data } = await axios.get(`/api/files/${productId}`);
      setExistingImages(data.images || []);
      onImagesChange(data.images.map((img) => img.name)); // Pass image names to parent
    } catch (error) {
      console.error('Error fetching existing images:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.webm']
    },
    maxSize: 10 * 1024 * 1024 , // 10MB
    onDrop: handleFileDrop
  });

  async function handleFileDrop(acceptedFiles) {
    try {
      setIsUploading(true);

      const uploadPromises = acceptedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const { data } = await axios.post(
          `/api/admin/upload-local?name_url=${productId}`,
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const progress = (progressEvent.loaded / progressEvent.total) * 100;
              setUploadProgress(progress);
            },
          }
        );

        return {
          url: data.url,
          name: file.name,
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const updatedImages = [...existingImages, ...uploadedFiles];
      setExistingImages(updatedImages);
      onImagesChange(updatedImages.map((img) => img.name)); // Pass updated image names to parent
      setProductData((prev) => ({
        ...prev,
        images: updatedImages,
      }));

      toast.success('Files uploaded successfully');

      // Refresh images after upload
      fetchExistingImages();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  const openDeleteModal = (index) => {
    setDeleteIndex(index);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteIndex(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deleteIndex !== null) {
      try {
        const imageToDelete = existingImages[deleteIndex];
        const { url } = imageToDelete;
        const filename = url.split('/').pop();
  
        await axios.delete(`/api/files/${productId}/delete`, {
          data: {
            name_url: productId,
            filename,
          },
        });
  
        const updatedImages = existingImages.filter((_, i) => i !== deleteIndex);
        setExistingImages(updatedImages);
        onImagesChange(updatedImages.map((img) => img.name)); // Pass updated image names to parent
        setProductData((prev) => ({
          ...prev,
          images: updatedImages,
        }));
  
        toast.success('Image deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete image');
      } finally {
        closeDeleteModal();
      }
    }
  };

  return (
    <Card>
      <CardContent>
        {/* Drop Zone */}
        <Box
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}`}
        >
          <input {...getInputProps()} />
          <AddPhotoAlternate className="text-4xl mb-2" />
          <Typography>
            Drag & drop files here, or click to select files
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Supports: JPG, PNG, WEBP, MP4 (max 10MB)
          </Typography>
        </Box>

        {/* Upload Progress */}
        {isUploading && (
          <Box className="mt-4">
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" className="mt-1">
              Uploading... {Math.round(uploadProgress)}%
            </Typography>
          </Box>
        )}

        {/* Media Grid */}
        <Grid container spacing={2} className="mt-4">
          {existingImages.map((item, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card className="relative group">
                  <Image
                    src={item.url}
                    alt={item.name}
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover"
                    unoptimized
                  />
                <Box className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <IconButton
                    size="small"
                    onClick={() => openDeleteModal(index)}
                  >
                    <Delete className="text-white" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={isDeleteModalOpen}
          onClose={closeDeleteModal}
          aria-labelledby="delete-confirmation-modal"
        >
          <DialogTitle id="delete-confirmation-modal">
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this image? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDeleteModal} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" className="bg-red-400">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
