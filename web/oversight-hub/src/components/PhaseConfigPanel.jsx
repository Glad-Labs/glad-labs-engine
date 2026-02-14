import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Slider,
  Stack,
  Button,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Trash2 } from 'lucide-react';

const normalizePhaseName = (name) =>
  typeof name === 'string' ? name.trim() : '';

const inferBasePhaseType = (phase = {}) => {
  const explicitType = normalizePhaseName(phase?.metadata?.phase_type);
  if (explicitType) {
    return explicitType;
  }

  const explicitAgent = normalizePhaseName(phase?.agent);
  if (explicitAgent) {
    return explicitAgent;
  }

  const phaseName = normalizePhaseName(phase?.name);
  if (!phaseName) {
    return '';
  }

  return phaseName.replace(/_\d+$/, '');
};

const ensureInputDefaults = (config) => {
  const metadata = config?.metadata || {};
  const inputSchema = Array.isArray(metadata.input_schema)
    ? metadata.input_schema
    : [];

  const existingInputs = metadata.phase_inputs || {};
  const phaseInputs = { ...existingInputs };

  inputSchema.forEach((field) => {
    if (!field?.key || phaseInputs[field.key] !== undefined) {
      return;
    }

    if (field.default_value !== undefined && field.default_value !== null) {
      phaseInputs[field.key] = field.default_value;
    } else {
      phaseInputs[field.key] = field.input_type === 'boolean' ? false : '';
    }
  });

  return {
    ...config,
    metadata: {
      ...metadata,
      phase_type: metadata.phase_type || inferBasePhaseType(config),
      phase_inputs: phaseInputs,
    },
  };
};

const PhaseConfigPanel = ({
  nodeId,
  phase,
  availableModels = [],
  onUpdate,
  onRemove,
}) => {
  const [config, setConfig] = useState(ensureInputDefaults(phase || {}));
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setConfig(ensureInputDefaults(phase || {}));
    setIsDirty(false);
  }, [phase]);

  const handleChange = (field, value) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (field === 'agent') {
        const phaseType = normalizePhaseName(value) || inferBasePhaseType(prev);
        next.metadata = {
          ...(prev?.metadata || {}),
          phase_type: phaseType,
        };
      }

      return next;
    });
    setIsDirty(true);
  };

  const handleMetadataValue = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      metadata: {
        ...(prev?.metadata || {}),
        [key]: value,
      },
    }));
    setIsDirty(true);
  };

  const handlePhaseInputValue = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      metadata: {
        ...(prev?.metadata || {}),
        phase_inputs: {
          ...((prev?.metadata || {}).phase_inputs || {}),
          [key]: value,
        },
      },
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    const normalized = ensureInputDefaults(config);
    onUpdate(nodeId, normalized);
    setIsDirty(false);
  };

  const handleRemove = () => {
    if (window.confirm(`Remove phase "${config.name}"?`)) {
      onRemove(nodeId);
    }
  };

  const phaseType = inferBasePhaseType(config);
  const inputSchema = Array.isArray(config?.metadata?.input_schema)
    ? config.metadata.input_schema
    : [];
  const phaseInputs = config?.metadata?.phase_inputs || {};

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Phase: {config.name}</Typography>

      <Divider />

      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Agent
          </Typography>
          <TextField
            value={config.agent || phaseType || config.name}
            onChange={(e) => handleChange('agent', e.target.value)}
            fullWidth
            size="small"
            helperText="Which agent should handle this phase"
          />
        </Box>

        <FormControl fullWidth size="small">
          <InputLabel id={`phase-model-label-${nodeId}`}>Model</InputLabel>
          <Select
            labelId={`phase-model-label-${nodeId}`}
            label="Model"
            value={config?.metadata?.selected_model || ''}
            onChange={(e) =>
              handleMetadataValue('selected_model', e.target.value)
            }
          >
            <MenuItem value="">
              <em>Use system default</em>
            </MenuItem>
            {availableModels.map((model) => (
              <MenuItem
                key={`${model.provider || 'provider'}-${model.name}`}
                value={model.name}
              >
                {model.displayName || model.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {inputSchema.length > 0 && (
          <>
            <Divider />
            <Typography variant="subtitle2">Phase Inputs</Typography>
            <Stack spacing={1.5}>
              {inputSchema.map((field) => {
                const fieldKey = field?.key;
                if (!fieldKey) {
                  return null;
                }

                const fieldLabel = field.label || fieldKey;
                const fieldValue = phaseInputs[fieldKey];
                const fieldType = field.input_type || 'text';

                if (fieldType === 'boolean') {
                  return (
                    <FormControlLabel
                      key={fieldKey}
                      control={
                        <Switch
                          checked={Boolean(fieldValue)}
                          onChange={(e) =>
                            handlePhaseInputValue(fieldKey, e.target.checked)
                          }
                        />
                      }
                      label={fieldLabel}
                    />
                  );
                }

                if (fieldType === 'select') {
                  return (
                    <FormControl fullWidth size="small" key={fieldKey}>
                      <InputLabel id={`phase-input-${nodeId}-${fieldKey}`}>
                        {fieldLabel}
                      </InputLabel>
                      <Select
                        labelId={`phase-input-${nodeId}-${fieldKey}`}
                        label={fieldLabel}
                        value={fieldValue ?? ''}
                        onChange={(e) =>
                          handlePhaseInputValue(fieldKey, e.target.value)
                        }
                      >
                        {!field.required && (
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                        )}
                        {(field.options || []).map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  );
                }

                if (fieldType === 'number') {
                  return (
                    <TextField
                      key={fieldKey}
                      type="number"
                      label={fieldLabel}
                      value={fieldValue ?? ''}
                      onChange={(e) =>
                        handlePhaseInputValue(
                          fieldKey,
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                      fullWidth
                      size="small"
                      required={Boolean(field.required)}
                      placeholder={field.placeholder || ''}
                    />
                  );
                }

                return (
                  <TextField
                    key={fieldKey}
                    label={fieldLabel}
                    value={fieldValue ?? ''}
                    onChange={(e) =>
                      handlePhaseInputValue(fieldKey, e.target.value)
                    }
                    fullWidth
                    size="small"
                    required={Boolean(field.required)}
                    placeholder={field.placeholder || ''}
                    multiline={fieldType === 'textarea'}
                    rows={fieldType === 'textarea' ? 3 : 1}
                  />
                );
              })}
            </Stack>
          </>
        )}

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Description
          </Typography>
          <TextField
            value={config.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            fullWidth
            multiline
            rows={2}
            size="small"
            placeholder="Phase description"
          />
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Timeout: {config.timeout_seconds || 300}s
          </Typography>
          <Slider
            value={config.timeout_seconds || 300}
            onChange={(_, value) => handleChange('timeout_seconds', value)}
            min={10}
            max={3600}
            step={10}
            marks={[
              { value: 60, label: '1m' },
              { value: 300, label: '5m' },
              { value: 600, label: '10m' },
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={(v) => `${(v / 60).toFixed(1)}m`}
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Max Retries: {config.max_retries || 3}
          </Typography>
          <Slider
            value={config.max_retries || 3}
            onChange={(_, value) => handleChange('max_retries', value)}
            min={0}
            max={10}
            step={1}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        {config.name?.includes('assess') && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Quality Threshold: {(config.quality_threshold || 0.7).toFixed(2)}
            </Typography>
            <Slider
              value={config.quality_threshold || 0.7}
              onChange={(_, value) => handleChange('quality_threshold', value)}
              min={0}
              max={1}
              step={0.05}
              marks={[
                { value: 0.5, label: '0.5' },
                { value: 0.7, label: '0.7' },
                { value: 0.9, label: '0.9' },
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => v.toFixed(2)}
            />
          </Box>
        )}

        <Divider />

        <FormControlLabel
          control={
            <Switch
              checked={config.skip_on_error || false}
              onChange={(e) => handleChange('skip_on_error', e.target.checked)}
            />
          }
          label="Skip if previous phase fails"
        />

        <FormControlLabel
          control={
            <Switch
              checked={config.required !== false}
              onChange={(e) => handleChange('required', e.target.checked)}
            />
          }
          label="Phase is required (workflow fails if this fails)"
        />

        <Divider />

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            onClick={handleSave}
            disabled={!isDirty}
            fullWidth
          >
            Save Changes
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<Trash2 size={16} />}
            onClick={handleRemove}
          >
            Remove
          </Button>
        </Stack>

        {isDirty && (
          <Alert severity="info" sx={{ py: 1 }}>
            You have unsaved changes
          </Alert>
        )}
      </Stack>
    </Stack>
  );
};

export default PhaseConfigPanel;
