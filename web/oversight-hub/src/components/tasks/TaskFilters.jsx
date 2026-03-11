/**
 * TaskFilters - Task filtering and sorting controls
 *
 * Allows users to:
 * - Sort by different fields
 * - Change sort direction
 * - Filter by status
 * - Reset filters
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';
import { filterBox, button, compactSelect } from '../../lib/muiStyles';

const TaskFilters = ({
  sortBy = 'created_at',
  sortDirection = 'desc',
  statusFilter = '',
  searchQuery = '',
  onSortChange,
  onDirectionChange,
  onStatusChange,
  onSearchChange,
  onResetFilters,
}) => {
  return (
    <Box sx={filterBox}>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          label="Sort By"
          sx={compactSelect}
        >
          <MenuItem value="created_at">Created Date</MenuItem>
          <MenuItem value="status">Status</MenuItem>
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="task_type">Task Type</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Direction</InputLabel>
        <Select
          value={sortDirection}
          onChange={(e) => onDirectionChange(e.target.value)}
          label="Direction"
          sx={compactSelect}
        >
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          label="Status"
          displayEmpty
          renderValue={(value) =>
            value === ''
              ? 'All Statuses'
              : value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')
          }
          MenuProps={{
            disableScrollLock: true,
            PaperProps: {
              sx: {
                maxHeight: 300,
                marginTop: '4px',
              },
            },
          }}
          sx={compactSelect}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="failed">Failed</MenuItem>
          <MenuItem value="published">Published</MenuItem>
        </Select>
      </FormControl>

      <TextField
        size="small"
        placeholder="Search tasks…"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: 200 }}
        inputProps={{ 'aria-label': 'Search tasks' }}
      />

      <Button
        variant="outlined"
        size="small"
        startIcon={<ClearIcon />}
        onClick={onResetFilters}
        sx={button.reset}
      >
        Reset
      </Button>
    </Box>
  );
};

export default TaskFilters;

TaskFilters.propTypes = {
  sortBy: PropTypes.string,
  sortDirection: PropTypes.string,
  statusFilter: PropTypes.string,
  searchQuery: PropTypes.string,
  onSortChange: PropTypes.func.isRequired,
  onDirectionChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onSearchChange: PropTypes.func,
  onResetFilters: PropTypes.func.isRequired,
};
