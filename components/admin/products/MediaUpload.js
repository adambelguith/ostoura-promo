import { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Grid,
  LinearProgress,
  Button,
} from '@mui/material';
import {
  AddPhotoAlternate,
  Delete,
  Edit,
  VideoLibrary,
  DragIndicator
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Image from 'next/image';
import { toast } from 'react-toastify';

export default function MediaUpload({ productId, productData, setProductData }) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'video/*': ['.mp4', '.webm']
    },
    maxSize: 10485760, // 10MB
    onDrop: handleFileDrop
  });

  async function handleFileDrop(acceptedFiles) {
    try {
      setIsUploading(true);
      const uploadPromises = acceptedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('productId', productId); // Add productId for directory structure

        const { data } = await axios.post('/api/admin/upload-local', formData, {
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(progress);
          }
        });

        return {
          original: data.url,
          thumbnail: data.thumbnail,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          size: file.size
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      
      setProductData(prev => ({
        ...prev,
        media: [...(prev.media || []), ...uploadedFiles]
      }));

      toast.success('Files uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  const handleDelete = async (index) => {
    try {
      const mediaToDelete = productData.media[index];
      
      // Delete from local storage
      await axios.delete('/api/admin/upload-local', {
        data: { 
          urls: [mediaToDelete.original, mediaToDelete.thumbnail],
          productId
        }
      });

      // Update state
      setProductData(prev => ({
        ...prev,
        media: prev.media.filter((_, i) => i !== index)
      }));

      toast.success('Media deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete media');
    }
  };

  const handleReorder = (dragIndex, hoverIndex) => {
    setProductData(prev => {
      const newMedia = [...prev.media];
      const dragItem = newMedia[dragIndex];
      newMedia.splice(dragIndex, 1);
      newMedia.splice(hoverIndex, 0, dragItem);
      return { ...prev, media: newMedia };
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4">
          Media Gallery
        </Typography>

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
          {productData.media?.map((item, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card 
                className="relative group cursor-move"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  handleReorder(dragIndex, index);
                }}
              >
                {item.type === 'image' ? (
                  <Image
                    src={item.thumbnail || item.original}
                    alt={item.name}
                    width={200}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <Box className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <VideoLibrary className="text-4xl" />
                  </Box>
                )}

                {/* Overlay Actions */}
                <Box className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(index)}
                  >
                    <Delete className="text-white" />
                  </IconButton>
                  <DragIndicator className="text-white" />
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
} 