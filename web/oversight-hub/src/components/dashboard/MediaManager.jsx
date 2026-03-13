import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Alert,
  Stack,
  Button,
  TextField,
  Grid,
  Tabs,
  Tab,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  generateImages,
  listMedia,
  deleteMedia,
  getMediaHealth,
} from '../../services/mediaService';

/**
 * MediaManager Component (Phase 2.2)
 *
 * Manages media assets:
 * - Generate featured images via Pexels/SDXL
 * - View uploaded/generated media gallery
 * - Delete media items
 * - Track media metrics
 */
export const MediaManager = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [title, setTitle] = useState('');
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 1) {
      loadMedia();
    }
  }, [activeTab]);

  const loadMedia = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listMedia({ limit: 50 });
      setMedia(result.media || []);
    } catch (err) {
      setError(`Failed to load media: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter an image prompt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateImages({
        prompt,
        title: title || undefined,
        use_pexels: true,
        use_generation: false,
      });

      if (result.success) {
        setSuccess(true);
        setPrompt('');
        setTitle('');
        setTimeout(() => setSuccess(false), 3000);
        // Refresh gallery after generating
        if (activeTab === 1) {
          await loadMedia();
        }
      } else {
        setError(result.message || 'Failed to generate image');
      }
    } catch (err) {
      setError(`Failed to generate image: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Are you sure you want to delete this media?')) {
      return;
    }

    try {
      await deleteMedia(mediaId);
      setMedia(media.filter((m) => m.id !== mediaId));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(`Failed to delete media: ${err.message}`);
    }
  };

  const handleChechHealth = async () => {
    setLoading(true);
    try {
      const health = await getMediaHealth();
      if (health.healthy) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Media service is not healthy');
      }
    } catch (err) {
      setError(`Health check failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          Media Manager
        </Typography>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          aria-label="Media manager sections"
        >
          <Tab
            label="Generate Image"
            id="media-tab-0"
            aria-controls="media-tabpanel-0"
          />
          <Tab
            label="Media Gallery"
            id="media-tab-1"
            aria-controls="media-tabpanel-1"
          />
        </Tabs>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          ✓ Operation completed successfully
        </Alert>
      )}

      {/* Tab 0: Image Generation */}
      {activeTab === 0 && (
        <Card>
          <CardHeader title="Generate Featured Image" />
          <CardContent>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Image Prompt"
                placeholder="e.g., AI gaming NPCs futuristic virtual reality"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
                multiline
                rows={3}
              />

              <TextField
                fullWidth
                label="Post Title (Optional)"
                placeholder="e.g., How AI-Powered NPCs are Making Games More Immersive"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGenerateImage}
                  disabled={loading || !prompt.trim()}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Generate Image'}
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleChechHealth}
                  disabled={loading}
                >
                  Check Health
                </Button>
              </Box>

              <Typography variant="caption" color="textSecondary">
                💡 Tip: Images are first searched on Pexels (free) before
                generation
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Tab 1: Media Gallery */}
      {activeTab === 1 && (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Media Gallery ({media.length} items)
            </Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadMedia}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>

          {loading && <CircularProgress />}

          {!loading && media.length === 0 && (
            <Alert severity="info">
              No media found. Generate some images first!
            </Alert>
          )}

          {!loading && media.length > 0 && (
            <Grid container spacing={2}>
              {media.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 3 },
                      transition: 'all 0.3s',
                    }}
                    onClick={() => {
                      setSelectedMedia(item);
                      setPreviewOpen(true);
                    }}
                  >
                    {item.url && (
                      <Box
                        sx={{ width: '100%', height: 200, overflow: 'hidden' }}
                      >
                        <img
                          src={item.url}
                          alt={item.title || 'Media image'}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            display: 'block',
                          }}
                        />
                      </Box>
                    )}
                    <CardContent>
                      <Typography variant="subtitle2" noWrap>
                        {item.title || item.id}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(item.created_at).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.url) {
                              window.open(item.url, '_blank');
                            }
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMedia(item.id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Media Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{selectedMedia?.title || 'Media Preview'}</DialogTitle>
        <DialogContent>
          {selectedMedia?.url && (
            <Box
              sx={{
                width: '100%',
                height: 300,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src={selectedMedia.url}
                alt={selectedMedia.title || 'Media preview'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaManager;
