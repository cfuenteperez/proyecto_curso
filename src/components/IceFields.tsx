import { Box, Slider, Stack, Typography } from '@mui/material';

import { MAX_ICE_VALUE, MIN_ICE_VALUE } from '../utils/validateIceScore';

import type { IceField, IceScoreDraft } from '../types/IceScore';

interface IceFieldsProps {
  values: IceScoreDraft;
  onChange: (field: IceField, value: number) => void;
}

const ICE_FIELDS: { field: IceField; label: string }[] = [
  { field: 'impact', label: 'Impacto' },
  { field: 'confidence', label: 'Confianza' },
  { field: 'effort', label: 'Esfuerzo' },
];

// getSliderValue devuelve un unico valor aunque el Slider admita rangos.
function getSliderValue(value: number | number[]): number {
  return Array.isArray(value) ? value[0] : value;
}

// IceFields permite ajustar manualmente Impacto, Confianza y Esfuerzo.
function IceFields({ values, onChange }: IceFieldsProps) {
  return (
    <Stack spacing={1}>
      {ICE_FIELDS.map(({ field, label }) => {
        const value = values[field];
        const isUnset = value === null;
        const labelId = `ice-field-${field}`;

        return (
          <Box key={field}>
            <Stack direction="row" justifyContent="space-between">
              <Typography id={labelId} variant="body2">
                {label}
              </Typography>
              <Typography fontWeight={700} variant="body2">
                {value ?? '—'}
              </Typography>
            </Stack>
            {/* Sin valor, el Slider no emite onChange al pulsar el minimo; onChangeCommitted cubre ese caso. */}
            <Slider
              aria-labelledby={labelId}
              getAriaValueText={(sliderValue) =>
                isUnset ? 'Sin valor' : String(sliderValue)
              }
              marks
              max={MAX_ICE_VALUE}
              min={MIN_ICE_VALUE}
              onChange={(_, newValue) =>
                onChange(field, getSliderValue(newValue))
              }
              onChangeCommitted={(_, newValue) =>
                onChange(field, getSliderValue(newValue))
              }
              step={1}
              sx={{ color: isUnset ? 'grey.400' : 'primary.main' }}
              track={isUnset ? false : 'normal'}
              value={value ?? MIN_ICE_VALUE}
              valueLabelDisplay="auto"
            />
          </Box>
        );
      })}
    </Stack>
  );
}

export default IceFields;
