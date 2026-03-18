/**
 * Natural Language Task Composer Component
 *
 * Allows users to compose capability tasks using natural language.
 * Shows suggested task with option to review or execute immediately.
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import { Play, CheckCircle, Zap } from 'lucide-react';
import {
  composeTaskFromNaturalLanguage,
  composeAndExecuteTask,
} from '../services/naturalLanguageComposerService';
import CapabilityTasksService from '../services/capabilityTasksService';

/**
 * Natural Language Task Composer
 *
 * Props:
 * - onTaskComposed: Callback when task is composed (receives task definition)
 * - onTaskExecuted: Callback when task is executed (receives execution result)
 * - compact: Boolean - show compact version (for chat integration)
 */
export default function NaturalLanguageTaskComposer({
  onTaskComposed,
  onTaskExecuted,
  compact = false,
}) {
  const [request, setRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [compositionResult, setCompositionResult] = useState(null);

  const handleCompose = async () => {
    if (!request.trim()) {
      setError('Please enter a request');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCompositionResult(null);

      const result = await composeTaskFromNaturalLanguage(request, {
        autoExecute: false,
        saveTask: true,
      });

      setCompositionResult(result);

      if (result.success && onTaskComposed) {
        onTaskComposed(result.task_definition);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteComposed = async () => {
    if (!compositionResult?.task_definition) {
      setError('No task to execute');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Execute the composed task
      const result = await CapabilityTasksService.executeTask(
        compositionResult.task_definition.id
      );

      if (onTaskExecuted) {
        onTaskExecuted(result);
      }

      setCompositionResult({
        ...compositionResult,
        execution_id: result.execution_id,
      });
    } catch (err) {
      setError(`Execution failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoExecute = async () => {
    if (!request.trim()) {
      setError('Please enter a request');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCompositionResult(null);

      const result = await composeAndExecuteTask(request, {
        saveTask: true,
      });

      setCompositionResult(result);

      if (result.success && onTaskExecuted) {
        onTaskExecuted(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Compact view (for chat)
  if (compact) {
    return (
      <Card sx={{ mb: 2, backgroundColor: '#f9f9f9' }}>
        <CardContent sx={{ pb: 1 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              🤖 Compose Task from Natural Language
            </Typography>

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {!compositionResult ? (
              <Stack spacing={1}>
                <TextField
                  label="Describe a task"
                  placeholder="E.g., Write a blog post about machine learning"
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  size="small"
                />

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCompose}
                    disabled={loading || !request.trim()}
                    startIcon={
                      loading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <CheckCircle size={16} />
                      )
                    }
                  >
                    Suggest Task
                  </Button>

                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={handleAutoExecute}
                    disabled={loading || !request.trim()}
                    startIcon={
                      loading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Zap size={16} />
                      )
                    }
                  >
                    Compose & Execute
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Box>
                {compositionResult.success ? (
                  <Box>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <CheckCircle
                        size={16}
                        style={{ color: '#4caf50', marginTop: 2 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2">
                          {compositionResult.task_definition?.name ||
                            'Task Composed'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {compositionResult.explanation}
                        </Typography>
                      </Box>
                    </Stack>

                    {!compositionResult.execution_id && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleExecuteComposed}
                        disabled={loading}
                        sx={{ mt: 1 }}
                      >
                        Execute Now
                      </Button>
                    )}

                    {compositionResult.execution_id && (
                      <Alert severity="success" sx={{ mt: 1 }}>
                        ✅ Task executed: {compositionResult.execution_id}
                      </Alert>
                    )}

                    <Button
                      size="small"
                      onClick={() => {
                        setCompositionResult(null);
                        setRequest('');
                      }}
                      sx={{ mt: 1, ml: 1 }}
                    >
                      Compose Another
                    </Button>
                  </Box>
                ) : (
                  <Alert severity="error">
                    {compositionResult.error || 'Failed to compose task'}
                  </Alert>
                )}
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Full view
  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardHeader
          title="Natural Language Task Composer"
          subheader="Describe what you want to do, and AI will suggest the right capabilities"
        />
        <CardContent>
          <Stack spacing={3}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {!compositionResult ? (
              <Box>
                <TextField
                  label="What would you like to accomplish?"
                  placeholder="E.g., 'Write a blog post about machine learning, add images, and publish to the blog'"
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  multiline
                  rows={4}
                  fullWidth
                  helperText="Be specific about the task and desired outcomes"
                />

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCompose}
                    disabled={loading || !request.trim()}
                    startIcon={
                      loading ? (
                        <CircularProgress size={18} />
                      ) : (
                        <CheckCircle size={18} />
                      )
                    }
                  >
                    Review Suggested Task
                  </Button>

                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleAutoExecute}
                    disabled={loading || !request.trim()}
                    startIcon={
                      loading ? (
                        <CircularProgress size={18} />
                      ) : (
                        <Zap size={18} />
                      )
                    }
                  >
                    Compose & Auto-Execute
                  </Button>
                </Stack>

                {loading && (
                  <Box
                    sx={{
                      mt: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <CircularProgress size={24} />
                    <Typography variant="body2">
                      Analyzing request...
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box>
                {compositionResult.success ? (
                  <Box>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        p: 2,
                        backgroundColor: '#f0f7ff',
                        borderRadius: 1,
                        mb: 2,
                      }}
                    >
                      <CheckCircle
                        size={24}
                        style={{ color: '#4caf50', marginTop: 2 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6">
                          {compositionResult.task_definition?.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {compositionResult.task_definition?.description}
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      Suggested Steps:
                    </Typography>

                    <Stack spacing={1} sx={{ mb: 2 }}>
                      {compositionResult.task_definition?.steps?.map(
                        (step, idx) => (
                          <Card key={idx} variant="outlined" sx={{ p: 1.5 }}>
                            <Stack direction="row" spacing={1}>
                              <Chip
                                label={`${idx + 1}`}
                                size="small"
                                color="primary"
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {step.capability_name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  Output: {step.output_key}
                                </Typography>
                              </Box>
                            </Stack>
                          </Card>
                        )
                      )}
                    </Stack>

                    <Typography
                      variant="caption"
                      sx={{ display: 'block', mb: 2 }}
                    >
                      Confidence:{' '}
                      {(compositionResult.confidence * 100).toFixed(0)}%
                    </Typography>

                    {!compositionResult.execution_id && (
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="contained"
                          color="success"
                          onClick={handleExecuteComposed}
                          disabled={loading}
                          startIcon={<Play size={18} />}
                        >
                          Execute Task
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setCompositionResult(null);
                            setRequest('');
                          }}
                        >
                          Start Over
                        </Button>
                      </Stack>
                    )}

                    {compositionResult.execution_id && (
                      <Alert severity="success">
                        ✅ Task is executing: {compositionResult.execution_id}
                      </Alert>
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {compositionResult.error || 'Failed to compose task'}
                    </Alert>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setCompositionResult(null);
                        setRequest('');
                      }}
                    >
                      Try Another Request
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
